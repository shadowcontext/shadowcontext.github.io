#!/usr/bin/env python3
"""Build the Threat Intel Dashboard from allowlisted government sources."""

from __future__ import annotations

import csv
import hashlib
import html
import io
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "_data" / "threat_dashboard.json"
IOC_PATH = ROOT / "assets" / "data" / "daily-iocs.csv"
IOC_FEED_PATHS = {
    "file_hashes": ROOT / "assets" / "data" / "daily-file-hashes.txt",
    "ip_addresses": ROOT / "assets" / "data" / "daily-ip-addresses.txt",
    "domains": ROOT / "assets" / "data" / "daily-domains.txt",
    "urls": ROOT / "assets" / "data" / "daily-urls.txt",
}
USER_AGENT = "ShadowContext-Threat-Dashboard/1.0 (+https://shadowcontext.com)"

KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
CISA_RSS = "https://www.cisa.gov/cybersecurity-advisories/all.xml"
CISA_ORIGIN = "https://www.cisa.gov"
NCSC_FEEDS = (
    "https://www.ncsc.gov.uk/api/1/services/v1/guidance-rss-feed.xml",
    "https://www.ncsc.gov.uk/api/1/services/v1/report-rss-feed.xml",
)
NCA_CERT = "https://nca.gov.sa/en/cert/"
IOC_SEED_BUNDLES = (
    {
        "url": "https://www.cisa.gov/sites/default/files/2025-09/AA25-239A_Countering_Chinese_State-Sponsored_Actors_Compromise_of_Networks_Worldwide_to_Feed_Global_Espionage_System.stix_.json",
        "advisory": "CISA AA25-239A",
        "source": "https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a",
    },
    {
        "url": "https://www.cisa.gov/sites/default/files/2023-12/aa23-347a-russian-foreign-intelligence-service-svr-exploiting-jetbrains-teamcity-cve-globally.json",
        "advisory": "CISA AA23-347A",
        "source": "https://www.cisa.gov/news-events/cybersecurity-advisories/aa23-347a",
    },
)

ACTOR_TERMS = (
    "state-sponsored",
    "state-supported",
    "threat actor",
    "cyber actor",
    "ransomware",
    "advanced persistent threat",
    "apt",
    "irgc",
    "prc",
    "russian",
    "iranian",
    "north korean",
)

ACTOR_SOURCES = (
    {
        "name": "Russian FSB Center 16",
        "aliases": "Berserk Bear · Energetic Bear · Static Tundra",
        "focus": "Edge routers, SNMP exposure, and critical infrastructure networks.",
        "date": "2026-07-13",
        "url": "https://www.cisa.gov/news-events/cybersecurity-advisories/aa26-194a",
    },
    {
        "name": "PRC state-sponsored actors",
        "aliases": "Volt Typhoon · Flax Typhoon",
        "focus": "Covert networks of compromised routers and persistent access to critical infrastructure.",
        "date": "2026-04-23",
        "url": "https://www.cisa.gov/news-events/cybersecurity-advisories/aa26-113a",
    },
    {
        "name": "IRGC-affiliated actors",
        "aliases": "CyberAv3ngers · Storm-0784 · Hydro Kitten",
        "focus": "Internet-exposed operational technology and programmable logic controllers.",
        "date": "2026-04-07",
        "url": "https://www.cisa.gov/news-events/cybersecurity-advisories/aa26-097a",
    },
    {
        "name": "PRC global espionage cluster",
        "aliases": "Salt Typhoon-associated activity",
        "focus": "Provider networks, routing infrastructure, and long-term access for intelligence collection.",
        "date": "2025-08-27",
        "url": "https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a",
    },
)


def fetch(url: str, timeout: int = 30) -> bytes:
    if not url.startswith("https://"):
        raise ValueError(f"refusing non-HTTPS source: {url}")
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status != 200:
            raise RuntimeError(f"{url} returned HTTP {response.status}")
        return response.read()


def plain(value: str | None) -> str:
    text = re.sub(r"<[^>]+>", " ", html.unescape(value or ""))
    return " ".join(text.split())


def short(value: str, limit: int = 180) -> str:
    value = plain(value)
    if len(value) <= limit:
        return value
    return value[: limit - 1].rsplit(" ", 1)[0] + "…"


def compact_count(value: int) -> str:
    """Return a stable, layout-safe count while preserving exact values elsewhere."""
    for threshold, suffix in ((1_000_000_000_000, "T"), (1_000_000_000, "B"), (1_000_000, "M"), (1_000, "K")):
        if value >= threshold:
            scaled = value / threshold
            precision = 0 if scaled >= 100 else 1
            rendered = f"{scaled:.{precision}f}"
            if "." in rendered:
                rendered = rendered.rstrip("0").rstrip(".")
            return rendered + suffix
    return str(value)


def rss_items(payload: bytes) -> list[dict]:
    root = ET.fromstring(payload)
    results = []
    for item in root.findall(".//item"):
        raw_date = item.findtext("pubDate") or ""
        try:
            item_date = parsedate_to_datetime(raw_date).date().isoformat()
        except (TypeError, ValueError):
            item_date = ""
        results.append(
            {
                "title": plain(item.findtext("title")),
                "url": (item.findtext("link") or "").strip(),
                "date": item_date,
                "summary": short(item.findtext("description")),
            }
        )
    return results


def nca_items(payload: bytes) -> list[dict]:
    page = payload.decode("utf-8", errors="replace")
    cards = re.findall(r'<a aria-label="id" href="([^"]+)">(.*?)</a>', page, re.S | re.I)
    results = []
    for href, card in cards[:8]:
        title = re.search(r'<p class="line-clamp-2">(.*?)</p>', card, re.S | re.I)
        warning = re.search(r'Warning Number.*?font-semibold">([^<]+)</span>', card, re.S | re.I)
        severity = re.search(r'data-testid="tag-[^"]+".*?<span[^>]*>(Critical|High|Medium|Low)</span>', card, re.S | re.I)
        published = re.search(r'Warning Date.*?font-semibold mt-2">([^<]+)</span>', card, re.S | re.I)
        if not title:
            continue
        iso_date = ""
        if published:
            try:
                iso_date = datetime.strptime(plain(published.group(1)), "%d/%m/%Y").date().isoformat()
            except ValueError:
                pass
        results.append(
            {
                "authority": "Saudi NCA / CERT",
                "title": plain(title.group(1)),
                "url": urllib.request.urljoin(NCA_CERT, href),
                "date": iso_date,
                "severity": plain(severity.group(1)).title() if severity else "",
                "summary": f"Security alert {plain(warning.group(1))}. Review the official notice for affected products and remediation guidance." if warning else "Review the official Saudi CERT alert for affected products and remediation guidance.",
            }
        )
    return results


def extract_iocs(bundle: dict, collected_at: str) -> list[dict]:
    document = json.loads(fetch(bundle["url"]))
    matches = []
    field_types = {
        "ipv4-addr:value": "ipv4",
        "ipv6-addr:value": "ipv6",
        "domain-name:value": "domain",
        "url:value": "url",
        "file:hashes.'SHA-256'": "sha256",
        "file:hashes.\"SHA-256\"": "sha256",
        "file:hashes.MD5": "md5",
        "file:hashes.'SHA-1'": "sha1",
    }
    expression = re.compile(r"([A-Za-z0-9_.:\-\"']+)\s*=\s*'([^']+)'", re.I)
    for obj in document.get("objects", []):
        if obj.get("type") != "indicator":
            continue
        for field, value in expression.findall(obj.get("pattern", "")):
            kind = field_types.get(field)
            if not kind:
                continue
            matches.append(
                {
                    "type": kind,
                    "value": value,
                    "source_advisory": bundle["advisory"],
                    "source_url": bundle["source"],
                    "collected_at": collected_at,
                    "tlp": "CLEAR",
                }
            )
    return matches


def discover_ioc_bundles(items: list[dict]) -> list[dict]:
    """Find STIX JSON attached to current CISA cybersecurity advisories."""
    bundles = list(IOC_SEED_BUNDLES)
    seen = {bundle["url"] for bundle in bundles}
    for item in items:
        source = item.get("url", "")
        if not source.startswith(f"{CISA_ORIGIN}/news-events/cybersecurity-advisories/"):
            continue
        try:
            page = fetch(source).decode("utf-8", errors="replace")
        except Exception as error:
            print(f"warning: unable to inspect CISA advisory attachments ({source}): {error}", file=sys.stderr)
            continue
        for href in re.findall(r"""href=["']([^"']+\.json(?:\?[^"']*)?)["']""", page, re.I):
            href = html.unescape(href)
            url = urllib.request.urljoin(CISA_ORIGIN, href)
            if not url.startswith(f"{CISA_ORIGIN}/sites/default/files/") or "stix" not in url.lower() or url in seen:
                continue
            bundles.append(
                {
                    "url": url,
                    "advisory": f"CISA {source.rstrip('/').rsplit('/', 1)[-1].upper()}",
                    "source": source,
                }
            )
            seen.add(url)
    return bundles


def build_actor_items(items: list[dict]) -> list[dict]:
    """Prefer current actor-focused CISA advisories, with vetted fallbacks."""
    actors = []
    for item in items:
        title = item.get("title", "")
        searchable = f"{title} {item.get('summary', '')}".lower()
        if "/cybersecurity-advisories/" not in item.get("url", "") or not any(term in searchable for term in ACTOR_TERMS):
            continue
        advisory_id = item["url"].rstrip("/").rsplit("/", 1)[-1].upper()
        focus = plain(item.get("summary", ""))
        if focus.lower().startswith(title.lower()):
            focus = focus[len(title) :].lstrip(" .:–—-")
        actors.append(
            {
                "name": short(title, 92),
                "aliases": f"CISA {advisory_id} · actor-focused advisory",
                "focus": short(focus or "Review the joint advisory for observed behavior, affected technology, and mitigations.", 150),
                "date": item.get("date", ""),
                "url": item["url"],
            }
        )
    actors.extend(ACTOR_SOURCES)
    unique = {}
    for actor in actors:
        unique.setdefault(actor["url"], actor)
    return sorted(unique.values(), key=lambda actor: (actor["date"], actor["name"]), reverse=True)[:4]


def write_iocs(rows: list[dict]) -> tuple[str, dict, list[dict]]:
    unique = {}
    for row in rows:
        unique[(row["type"], row["value"].lower())] = row
    ordered = sorted(unique.values(), key=lambda row: (row["type"], row["value"].lower()))
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=("type", "value", "source_advisory", "source_url", "collected_at", "tlp"), lineterminator="\n")
    writer.writeheader()
    writer.writerows(ordered)
    content = output.getvalue()
    IOC_PATH.parent.mkdir(parents=True, exist_ok=True)
    IOC_PATH.write_text(content, encoding="utf-8")
    feed_types = {
        "file_hashes": {"md5", "sha1", "sha256"},
        "ip_addresses": {"ipv4", "ipv6"},
        "domains": {"domain"},
        "urls": {"url"},
    }
    feed_labels = {
        "file_hashes": "File hash feed",
        "ip_addresses": "IP address feed",
        "domains": "Domain feed",
        "urls": "URL feed",
    }
    feeds = []
    for key, path in IOC_FEED_PATHS.items():
        current_values = {row["value"] for row in ordered if row["type"] in feed_types[key]}
        existing_values = {value.strip() for value in path.read_text(encoding="utf-8").splitlines() if value.strip()} if path.exists() else set()
        added_today = {value.lower() for value in current_values} - {value.lower() for value in existing_values}
        cumulative = {value.lower(): value for value in existing_values}
        cumulative.update({value.lower(): value for value in current_values})
        values = sorted(cumulative.values(), key=str.lower)
        path.write_text("\n".join(values) + ("\n" if values else ""), encoding="utf-8")
        feeds.append(
            {
                "key": key,
                "label": feed_labels[key],
                "count": len(values),
                "count_display": compact_count(len(values)),
                "count_exact": f"{len(values):,}",
                "added_today": len(added_today),
                "added_today_display": compact_count(len(added_today)),
                "added_today_exact": f"{len(added_today):,}",
                "path": "/" + str(path.relative_to(ROOT)),
            }
        )
    return hashlib.sha256(content.encode()).hexdigest(), dict(sorted(Counter(row["type"] for row in ordered).items())), feeds


def main() -> int:
    now = datetime.now(timezone.utc)
    today = now.date()
    health = []

    kev = json.loads(fetch(KEV_URL))
    vulnerabilities = kev.get("vulnerabilities", [])
    if not vulnerabilities:
        raise RuntimeError("CISA KEV feed returned no vulnerabilities")
    health.append({"name": "CISA KEV", "coverage": "Confirmed exploited vulnerabilities", "url": KEV_URL, "status": "online"})

    cisa = rss_items(fetch(CISA_RSS))
    health.append({"name": "CISA Advisories", "coverage": "Technical and industrial-control advisories", "url": CISA_RSS, "status": "online"})

    ncsc = []
    try:
        for feed in NCSC_FEEDS:
            ncsc.extend(rss_items(fetch(feed)))
        health.append({"name": "UK NCSC", "coverage": "Guidance and technical reports", "url": NCSC_FEEDS[0], "status": "online"})
    except Exception as error:
        print(f"warning: UK NCSC feed unavailable: {error}", file=sys.stderr)
        health.append({"name": "UK NCSC", "coverage": "Guidance and technical reports", "url": NCSC_FEEDS[0], "status": "degraded"})

    nca = []
    try:
        nca = nca_items(fetch(NCA_CERT))
        if not nca:
            raise RuntimeError("no alert cards found")
        health.append({"name": "Saudi NCA / CERT", "coverage": "Saudi national security alerts", "url": NCA_CERT, "status": "online"})
    except Exception as error:
        print(f"warning: Saudi NCA feed unavailable: {error}", file=sys.stderr)
        health.append({"name": "Saudi NCA / CERT", "coverage": "Saudi national security alerts", "url": NCA_CERT, "status": "degraded"})

    iocs = []
    successful_bundles = 0
    ioc_bundles = discover_ioc_bundles(cisa)
    for bundle in ioc_bundles:
        try:
            iocs.extend(extract_iocs(bundle, today.isoformat()))
            successful_bundles += 1
        except Exception as error:
            print(f"warning: IOC bundle unavailable ({bundle['advisory']}): {error}", file=sys.stderr)
    if not successful_bundles:
        raise RuntimeError("all allowlisted government IOC bundles failed")
    ioc_sha, ioc_counts, ioc_feeds = write_iocs(iocs)
    ioc_total = sum(ioc_counts.values())
    health.append({"name": "CISA STIX", "coverage": f"TLP:CLEAR indicators from {successful_bundles} advisories", "url": ioc_bundles[0]["source"], "status": "online" if successful_bundles == len(ioc_bundles) else "degraded"})

    parsed = []
    for item in vulnerabilities:
        try:
            added = date.fromisoformat(item["dateAdded"])
        except (KeyError, ValueError):
            continue
        item["_added"] = added
        parsed.append(item)
    parsed.sort(key=lambda item: (item["_added"], item.get("cveID", "")), reverse=True)

    recent_year = [item for item in parsed if item["_added"] >= today - timedelta(days=365) and item["_added"] <= today]
    vendors = Counter(item.get("vendorProject") or "Unknown" for item in recent_year)
    products = {}
    for vendor, _count in vendors.most_common(6):
        products[vendor] = Counter(item.get("product") or "Multiple products" for item in recent_year if (item.get("vendorProject") or "Unknown") == vendor).most_common(1)[0][0]
    max_count = max(vendors.values()) if vendors else 1
    platforms = [{"vendor": vendor, "product": products[vendor], "count": count, "percent": round(count / max_count * 100)} for vendor, count in vendors.most_common(6)]

    latest = []
    for item in parsed[:8]:
        latest.append(
            {
                "cve": item.get("cveID", ""),
                "name": item.get("vulnerabilityName", ""),
                "vendor": item.get("vendorProject", ""),
                "product": item.get("product", ""),
                "date_added": item.get("dateAdded", ""),
                "due_date": item.get("dueDate", ""),
                "ransomware": item.get("knownRansomwareCampaignUse", "Unknown"),
                "url": f"https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext={item.get('cveID', '')}",
            }
        )

    allowed_cisa = [item for item in cisa if any(path in item["url"] for path in ("/ics-advisories/", "/cybersecurity-advisories/", "/known-exploited-vulnerabilities", "/alerts/"))]
    advisory_items = []
    for item in allowed_cisa[:4]:
        advisory_items.append({**item, "authority": "CISA", "severity": ""})
    for item in sorted(nca, key=lambda x: x["date"], reverse=True)[:3]:
        advisory_items.append(item)
    for item in sorted(ncsc, key=lambda x: x["date"], reverse=True)[:2]:
        advisory_items.append({**item, "authority": "UK NCSC", "severity": ""})
    advisory_items.sort(key=lambda item: item["date"], reverse=True)
    advisory_items = advisory_items[:8]

    due_soon = 0
    for item in parsed:
        try:
            due = date.fromisoformat(item.get("dueDate", ""))
        except ValueError:
            continue
        if today <= due <= today + timedelta(days=7):
            due_soon += 1

    data = {
        "generated_at": now.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "generated_display": now.strftime("%d %b %Y · %H:%M UTC"),
        "metrics": {
            "kev_total": len(parsed),
            "kev_added_30d": sum(today - timedelta(days=30) <= item["_added"] <= today for item in parsed),
            "due_next_7d": due_soon,
            "ioc_total": ioc_total,
            "ioc_total_display": compact_count(ioc_total),
            "ioc_total_exact": f"{ioc_total:,}",
        },
        "vulnerabilities": latest,
        "platforms": platforms,
        "actors": build_actor_items(cisa),
        "advisories": advisory_items,
        "ioc_counts": ioc_counts,
        "ioc_count_summary": [
            {"type": kind, "count": count, "display": compact_count(count), "exact": f"{count:,}"}
            for kind, count in sorted(ioc_counts.items())
        ],
        "ioc_feeds": ioc_feeds,
        "ioc_sha256": ioc_sha,
        "sources": {
            "kev": {"url": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog"},
            "ioc_bundles": ioc_bundles,
        },
        "source_health": health,
    }
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    DATA_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote dashboard data, consolidated CSV, and {len(ioc_feeds)} IOC feeds ({ioc_total} indicators)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
