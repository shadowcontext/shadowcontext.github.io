---
title: "Bold Reports Path Flaws Demand Stronger Input Boundaries"
subtitle: "Four new CVE records show why report content must never inherit the server's filesystem authority."
description: "Bold Reports Designer before 14.1.12 has four path-validation flaws, making inventory, upgrades and restricted service permissions immediate priorities."
date: 2026-07-24 06:10:05 +0400
layout: post
category: defense
tags: [vulnerability-management, path-traversal, reporting-tools, least-privilege]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-07-24-bold-reports-path-flaws-demand-input-boundaries.svg
image_alt: "Abstract report pages approaching a protected server vault while unsafe file paths are diverted at luminous boundary rings"
key_points:
  - "Three flaws expose server files without authentication through separate report-processing features."
  - "A fourth flaw lets an authenticated user escape the intended upload directory."
  - "Upgrade to 14.1.12 and reduce the report designer service's filesystem authority."
sources:
  - title: "CVE-2026-65687"
    publisher: "CVE Program · July 23, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-65687"
  - title: "CVE-2026-65688"
    publisher: "CVE Program · July 23, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-65688"
  - title: "CVE-2026-65689"
    publisher: "CVE Program · July 23, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-65689"
  - title: "CVE-2026-65690"
    publisher: "CVE Program · July 23, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-65690"
---

Four CVE records published July 23 put a sharp boundary around a familiar defensive problem: a reporting application can handle documents, fonts, images and database material while still holding the permissions of a server process.

The records affect Bold Reports Standalone Report Designer before version 14.1.12. Three describe unauthenticated file reading through different features; the fourth describes an authenticated upload path that can reach beyond its intended directory. This report is based on the vulnerability disclosures, not on any organizational breach.

## Four paths, one missing control

CVE-2026-65687 concerns missing file-path validation in SVG processing. CVE-2026-65688 identifies the same class of failure in font processing, while CVE-2026-65689 places it in the database download feature. According to the CVE records, each can allow an unauthenticated attacker to read arbitrary files from the server filesystem.

The fourth issue changes the consequence. CVE-2026-65690 affects file uploads and requires authentication. Its record says a crafted filename can traverse outside the intended directory and that successful exploitation can lead to command execution with high privileges.

These are separate entry points, but defenders should read them as a shared design warning. A control applied only to the obvious upload field is insufficient when report rendering can also resolve fonts, images and database-related paths. Every path accepted from report content or a request must be canonicalized, constrained to an approved root and rejected if the resolved destination escapes it.

## Version discovery comes first

The affected range in all four records is every version before 14.1.12. That makes the immediate task precise: find installations, establish their exact version and move affected systems to 14.1.12 or later through the vendor-supported update process.

Inventory should not stop at entries named “report server.” The product is a standalone designer used to create, preview and export RDL and RDLC reports, so it may sit on analyst workstations, shared application servers, build images or utility hosts outside the main production catalogue. Search software management records, package repositories, deployment scripts and golden images. Ask teams that produce paginated reports which tools they use and where those tools run.

Then establish exposure. Determine whether the designer or any associated service accepts network requests, which users can submit or open report material, and what directories its process identity can read or modify. Internet reachability increases urgency, but internal placement is not a compensating control for the three unauthenticated paths. An internal service can still expose credentials, configuration or other secrets to any actor who gains a route to it.

## Reduce the consequence of a missed path

Updating closes the disclosed version range; least privilege limits the damage from the next missed validation branch. Run the application under a dedicated, non-administrative identity. Deny it access to operating-system secrets, unrelated application configuration, credential stores and deployment keys. Give write permission only to explicitly required working and export directories.

Treat report definitions and their referenced assets as active inputs, not passive office files. Route material from untrusted or external sources through an isolated review environment. Separate authoring from high-value production hosts, and avoid placing reusable secrets in directories readable by the designer service. Where the application must connect to databases, use narrowly scoped credentials rather than a general administrative account.

Defenders should also monitor for unexpected file access by the designer process, writes outside its normal working directories, and child processes that do not belong to routine report generation. Those signals do not prove exploitation, but they are useful checks during the upgrade window and durable detections afterward.

## Make path handling a release gate

This cluster is a reminder that file-path security is a system property. Test image, font, import, export, download and upload workflows against the same rule: after decoding and normalization, the resolved path must remain inside the intended directory. Test alternate separators, absolute paths, symbolic links and encoded input in a safe quality-assurance environment without turning the exercise into an exploit demonstration.

Finally, verify the outcome rather than closing the ticket when an installer finishes. Record the running version, restart state, process identity and effective directory permissions. Re-scan managed images so an older build cannot be redeployed later.

Report designers bridge human-authored content and privileged server resources. The durable defense is to make that bridge narrow: validate every path, grant the process little authority, isolate untrusted content and prove that the fixed build is the one actually running.
