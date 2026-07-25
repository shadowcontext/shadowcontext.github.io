#!/usr/bin/env python3
"""Render a compact before/after dashboard report for CI job summaries."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--before", type=Path, required=True)
    parser.add_argument("--after", type=Path, required=True)
    args = parser.parse_args()
    before, after = load(args.before), load(args.after)
    before_feeds = {item["key"]: item for item in before["ioc_feeds"]}
    after_feeds = {item["key"]: item for item in after["ioc_feeds"]}

    print("## Threat dashboard refresh")
    print()
    print("| Signal | Before | After |")
    print("| --- | ---: | ---: |")
    rows = (
        ("Generated", before["generated_display"], after["generated_display"]),
        ("CISA KEV catalog", before["metrics"]["kev_total"], after["metrics"]["kev_total"]),
        ("KEVs added in 30 days", before["metrics"]["kev_added_30d"], after["metrics"]["kev_added_30d"]),
        ("Deadlines in 7 days", before["metrics"]["due_next_7d"], after["metrics"]["due_next_7d"]),
        ("Daily IOC snapshot", before["metrics"]["ioc_total"], after["metrics"]["ioc_total"]),
    )
    for label, old, new in rows:
        print(f"| {label} | {old} | {new} |")
    for key, label in (
        ("file_hashes", "Cumulative file hashes"),
        ("ip_addresses", "Cumulative IP addresses"),
        ("domains", "Cumulative domains"),
        ("urls", "Cumulative URLs"),
    ):
        print(f"| {label} | {before_feeds[key]['count']} | {after_feeds[key]['count']} |")
    print()
    print(f"Top vulnerability after refresh: **{after['vulnerabilities'][0]['cve']}** ({after['vulnerabilities'][0]['date_added']})")
    print()
    print(f"Top actor advisory after refresh: **{after['actors'][0]['name']}** ({after['actors'][0]['date']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
