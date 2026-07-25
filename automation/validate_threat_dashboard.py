#!/usr/bin/env python3
"""Validate generated Threat Intel Dashboard data and append-only IOC feeds."""

from __future__ import annotations

import argparse
import csv
import hashlib
import ipaddress
import json
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA_RELATIVE = Path("_data/threat_dashboard.json")
CSV_RELATIVE = Path("assets/data/daily-iocs.csv")
FEED_RELATIVES = {
    "file_hashes": Path("assets/data/daily-file-hashes.txt"),
    "ip_addresses": Path("assets/data/daily-ip-addresses.txt"),
    "domains": Path("assets/data/daily-domains.txt"),
    "urls": Path("assets/data/daily-urls.txt"),
}
IOC_TYPES = {"md5", "sha1", "sha256", "ipv4", "ipv6", "domain", "url"}
HASH_LENGTHS = {"md5": 32, "sha1": 40, "sha256": 64}
DOMAIN = re.compile(r"(?=^.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$", re.I)


def https(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def validate_value(kind: str, value: str) -> bool:
    try:
        if kind in {"ipv4", "ipv6"}:
            address = ipaddress.ip_address(value)
            return address.version == (4 if kind == "ipv4" else 6)
        if kind in {"md5", "sha1", "sha256"}:
            return len(value) == HASH_LENGTHS[kind] and bool(re.fullmatch(r"[0-9a-f]+", value, re.I))
        if kind == "domain":
            return bool(DOMAIN.fullmatch(value))
        if kind == "url":
            parsed = urlparse(value)
            return parsed.scheme in {"http", "https"} and bool(parsed.netloc)
    except ValueError:
        return False
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--baseline-root", type=Path)
    parser.add_argument("--max-age-hours", type=int, default=30)
    args = parser.parse_args()
    root = args.root.resolve()
    errors: list[str] = []

    try:
        data = json.loads((root / DATA_RELATIVE).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"dashboard validation failed: {error}", file=sys.stderr)
        return 1

    try:
        generated = datetime.fromisoformat(data["generated_at"].replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        if generated > now + timedelta(minutes=5):
            fail(errors, "generated_at is in the future")
        if generated < now - timedelta(hours=args.max_age_hours):
            fail(errors, f"generated_at is older than {args.max_age_hours} hours")
    except (KeyError, ValueError):
        fail(errors, "generated_at is missing or invalid")

    metrics = data.get("metrics", {})
    if not isinstance(metrics.get("kev_total"), int) or metrics.get("kev_total", 0) < 1000:
        fail(errors, "KEV total is implausibly low")
    vulnerabilities = data.get("vulnerabilities", [])
    if len(vulnerabilities) != 8:
        fail(errors, "dashboard must contain eight current vulnerabilities")
    cves = [item.get("cve", "") for item in vulnerabilities]
    if len(set(cves)) != len(cves) or any(not re.fullmatch(r"CVE-\d{4}-\d{4,}", cve) for cve in cves):
        fail(errors, "vulnerability CVEs are missing, malformed, or duplicated")
    for section in ("actors", "advisories", "source_health"):
        if not data.get(section):
            fail(errors, f"{section} is empty")
    if not all(https(item.get("url", "")) for section in ("vulnerabilities", "actors", "advisories", "source_health") for item in data.get(section, [])):
        fail(errors, "one or more dashboard source URLs are not HTTPS")
    health = {item.get("name"): item.get("status") for item in data.get("source_health", [])}
    if health.get("CISA KEV") != "online":
        fail(errors, "required CISA KEV source is not online")
    if health.get("CISA STIX") not in {"online", "degraded"}:
        fail(errors, "required CISA STIX source did not produce indicators")

    csv_path = root / CSV_RELATIVE
    try:
        content = csv_path.read_bytes()
        rows = list(csv.DictReader(content.decode("utf-8").splitlines()))
    except (OSError, UnicodeError, csv.Error) as error:
        fail(errors, f"IOC CSV is unreadable: {error}")
        rows = []
        content = b""
    expected_fields = {"type", "value", "source_advisory", "source_url", "collected_at", "tlp"}
    if rows and set(rows[0]) != expected_fields:
        fail(errors, "IOC CSV columns do not match the published schema")
    if hashlib.sha256(content).hexdigest() != data.get("ioc_sha256"):
        fail(errors, "IOC CSV SHA-256 does not match dashboard metadata")
    if len(rows) != metrics.get("ioc_total"):
        fail(errors, "IOC CSV row count does not match dashboard metrics")
    keys = [(row.get("type", ""), row.get("value", "").lower()) for row in rows]
    if len(keys) != len(set(keys)):
        fail(errors, "IOC CSV contains duplicate type/value pairs")
    for row in rows:
        kind, value = row.get("type", ""), row.get("value", "")
        if kind not in IOC_TYPES or not validate_value(kind, value):
            fail(errors, f"invalid {kind or 'unknown'} IOC value: {value[:80]}")
        if row.get("tlp") != "CLEAR" or not https(row.get("source_url", "")):
            fail(errors, f"IOC provenance is invalid for {value[:80]}")
    counts = dict(sorted(Counter(row["type"] for row in rows).items()))
    if counts != data.get("ioc_counts"):
        fail(errors, "IOC type counts do not match dashboard metadata")

    feed_metadata = {item.get("key"): item for item in data.get("ioc_feeds", [])}
    if set(feed_metadata) != set(FEED_RELATIVES):
        fail(errors, "typed IOC feed metadata is incomplete")
    for key, relative in FEED_RELATIVES.items():
        try:
            values = [line.strip() for line in (root / relative).read_text(encoding="utf-8").splitlines() if line.strip()]
        except OSError as error:
            fail(errors, f"{key} feed is unreadable: {error}")
            continue
        if len({value.lower() for value in values}) != len(values):
            fail(errors, f"{key} feed contains duplicates")
        metadata = feed_metadata.get(key, {})
        if len(values) != metadata.get("count"):
            fail(errors, f"{key} feed count does not match dashboard metadata")
        if metadata.get("path") != f"/{relative.as_posix()}":
            fail(errors, f"{key} feed path does not match its published endpoint")
        if args.baseline_root:
            baseline_path = args.baseline_root.resolve() / relative
            if baseline_path.exists():
                baseline = {line.strip().lower() for line in baseline_path.read_text(encoding="utf-8").splitlines() if line.strip()}
                if not baseline.issubset({value.lower() for value in values}):
                    fail(errors, f"{key} feed is not append-only; prior indicators were removed")

    if errors:
        print("\n".join(f"dashboard validation: {error}" for error in errors), file=sys.stderr)
        return 1
    print(
        f"dashboard validation passed: {metrics['kev_total']} KEVs, "
        f"{len(vulnerabilities)} prioritized vulnerabilities, {len(rows)} daily IOCs, "
        f"{sum(item['count'] for item in feed_metadata.values())} cumulative typed-feed entries"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
