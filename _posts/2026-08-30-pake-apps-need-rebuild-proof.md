---
title: "Pake Fix Requires Rebuilding the Apps It Generated"
subtitle: "A path-traversal fix in the desktop-app builder only reaches users when downstream applications are rebuilt and redistributed."
description: "CVE-2026-82635 shows why updating a desktop-app builder is incomplete without rebuilding, redistributing, and verifying every generated application."
date: 2026-08-30 18:09:53 +0400
layout: post
category: defense
tags: [vulnerability-management, desktop-security, software-supply-chain, path-traversal]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-30-pake-apps-need-rebuild-proof.svg
image_alt: "Abstract desktop window sending a download into a bounded folder while rebuilt application tiles emerge behind a protective arc"
key_points:
  - "Pake-generated apps built from trees before 3.13.1 are affected."
  - "The fix constrains download filenames to a safe final path segment."
  - "Defenders must rebuild, redistribute, and verify downstream applications."
sources:
  - title: "Pake arbitrary file write via unsanitized download_file filename"
    publisher: "CVE Program · 30 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82635.json"
  - title: "fix: sanitize download filenames"
    publisher: "Pake · 3 July 2026"
    url: "https://github.com/tw93/Pake/commit/a5463a84d6e36705ee0dd1886cf0e4b5a75b0ab4"
  - title: "Pake V3.13.1"
    publisher: "Pake · 4 July 2026"
    url: "https://github.com/tw93/Pake/releases/tag/V3.13.1"
---

A newly published vulnerability record for Pake turns a familiar path-traversal bug into a software-distribution lesson. Updating the builder is necessary, but it does not change desktop applications that have already been generated and shipped. Those artifacts need their own inventory, rebuild, redistribution and verification cycle.

## The boundary failed at the filename

CVE-2026-82635 describes an arbitrary file-write vulnerability in Pake, a tool that packages web pages as desktop applications. According to the CVE record, applications generated from a Pake tree before version 3.13.1 are affected when their webview can call the native `download_file` command.

The unsafe behavior was conceptually simple: the native command joined a filename supplied through the JavaScript-facing bridge to the user's Downloads directory without first reducing it to a safe filename. Path components could therefore cause the resolved destination to fall outside that intended directory. The record assigns a CVSS 3.1 score of 8.8 and says opening the application is the required user interaction. It does not claim observed exploitation in the wild.

This matters because a download feature crosses two trust boundaries at once. Content begins in a web context, then a native component performs the network request and writes with the user's filesystem permissions. The Downloads folder is only a security boundary if the application verifies the final resolved destination rather than assuming that joining an untrusted name to a trusted directory keeps the result inside it.

## The shipped fix narrows the destination

The upstream patch added a filename-sanitizing function and applied it to both relevant download paths. The commit says the code now uses a safe final filename segment, preventing traversal outside the Downloads directory. It also added tests for ordinary names, nested paths, Windows-style separators, empty values and parent-directory values.

The CVE record identifies Pake 3.13.1 as the first fixed version; the project's release page shows that version was published on 4 July. Teams should use 3.13.1 or later, with the current approved release selected through their normal compatibility process. The defensive objective is not merely to see a sufficiently high version in a developer environment. It is to ensure the sanitizing behavior is compiled into every application offered to users.

The patch is also a useful review pattern for other desktop webview wrappers. Native commands exposed to page content should accept narrow, typed inputs; derive filenames rather than trust paths; resolve destinations beneath an approved root; and reject any result that escapes that root. Network permissions and filesystem permissions should be reviewed together because their combination determines the practical consequence of a bridge flaw.

## Builder inventory must lead to artifact inventory

Start with build provenance. Identify repositories, release jobs and developer workstations that used Pake before 3.13.1. Then map those builder instances to the desktop artifacts they produced, including internal utilities, pilot builds and platform-specific packages. A source repository that has been upgraded can coexist with older binaries still available from a download page, package store or software-management cache.

For each affected application, rebuild from a reviewed fixed tree and issue a new artifact rather than treating the builder upgrade as retroactive protection. Preserve the new artifact's version, build record and cryptographic digest, then remove superseded packages from managed distribution points where policy permits. If an application cannot be rebuilt promptly, defenders should consider pausing distribution and limiting it to trusted content until the native bridge exposure is understood.

Risk prioritization should reflect reachability. The CVE's high-severity scenario assumes the wrapped page, including a remote origin, can reach the download command. Apps that load changeable external content deserve attention before fixed, locally bundled content with a tightly constrained bridge. That distinction should be established by configuration and testing, not by the apparent trustworthiness of the website being wrapped.

## Verification must follow the rebuilt binary

Close the work with evidence from the deliverable. Confirm that each rebuilt package reports the expected application version and build provenance, and test that download operations remain within the approved directory across macOS, Windows and Linux variants actually distributed. Validate normal filenames and malformed path-like inputs without using live malicious content.

Finally, verify that update channels deliver the rebuilt artifact to representative endpoints and that old packages are no longer installable through managed catalogs. The durable lesson from CVE-2026-82635 is that generated applications inherit the security state of their toolchain at build time. Remediation is complete only when the fixed boundary is present in the binary users run.
