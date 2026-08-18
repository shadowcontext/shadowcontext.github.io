---
title: "Cryptographic Fallbacks Need Fail-Closed Proof"
subtitle: "Two newly published CVEs show why decryption errors must never select a weaker security mode."
description: "New openssl_encrypt CVEs turn silent cryptographic fallback into an inventory, upgrade, and fail-closed testing priority."
date: 2026-08-18 13:11:03 +0400
layout: post
category: defense
tags: [cryptography, vulnerability-management, software-supply-chain, secure-design]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-18-cryptographic-fallbacks-need-fail-closed-proof.svg
image_alt: "Abstract encrypted data stream meeting a sealed verification gate while a weaker fallback path is blocked"
key_points:
  - "CVE-2026-74900 and CVE-2026-74901 cover fail-open behavior in openssl_encrypt versions before 1.4.0."
  - "The records describe separate fallbacks that weaken key establishment and authenticated decryption after errors."
  - "Defenders should verify the running artifact and prove that invalid cryptographic inputs stop processing."
sources:
  - title: "openssl_encrypt before 1.4.0 Authentication Bypass via AES-CTR Fallback"
    publisher: "VulnCheck via CVE Program · 17 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/74xxx/CVE-2026-74901.json"
  - title: "openssl_encrypt before 1.4.0 Weak Shared Secret via PQC Simulation Mode"
    publisher: "VulnCheck via CVE Program · 17 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/74xxx/CVE-2026-74900.json"
  - title: "PQC fallback to unauthenticated AES-CTR when GCM fails"
    publisher: "jahlives · 10 February 2026"
    url: "https://github.com/jahlives/openssl_encrypt/security/advisories/GHSA-w4j7-wfgw-r52w"
  - title: "OpenSSL Encrypt v1.4.0 -- Stable Release"
    publisher: "jahlives · 3 March 2026"
    url: "https://github.com/jahlives/openssl_encrypt/releases/tag/v1.4.0"
---

Two CVE records published on 17 August put a clear label on a dangerous design pattern: cryptographic failure that quietly becomes permission to continue. For defenders, CVE-2026-74900 and CVE-2026-74901 are a reason to find `openssl_encrypt`, verify its running version and test what actually happens when authentication or key-establishment checks fail.

## What the new records establish

VulnCheck's CVE records identify versions before 1.4.0 as affected and version 1.4.0 as unaffected. Both records assign critical severity: 9.8 under CVSS 3.1 and 9.3 under CVSS 4.0. CISA's enrichment attached to the records marks exploitation as none, so the available sources do not establish observed abuse.

CVE-2026-74901 concerns authenticated decryption. The record says that when AES-GCM decryption fails, affected code can fall back to AES-CTR, a mode that does not provide the same integrity guarantee. The project's February advisory says the fallback was intended for testing but lacked a production guard. The defensive consequence is straightforward: data that fails authentication may still be processed instead of being rejected.

CVE-2026-74900 concerns post-quantum key establishment. According to its record, a decapsulation failure can select a simulation path that derives a deterministic shared secret from limited private-key material and public input. These are distinct flaws, but they share the same control failure: an error on a security-critical path selects weaker behavior rather than stopping the operation.

The CVEs are new; the underlying project work is not. The advisories were published in February, and the stable 1.4.0 release followed on 3 March. That distinction matters. This is not evidence of a newly introduced weakness or a current breach. It is a fresh, standardized signal that may now reach dependency scanners and asset workflows that did not track the earlier project advisories.

## Why silent fallback breaks assurance

Encryption is more than producing unreadable bytes. Authenticated encryption is expected to detect unauthorized modification, while key-establishment mechanisms are expected to fail when their validation cannot complete. A fallback that preserves availability by weakening either property changes the security contract at precisely the moment the input is least trustworthy.

Operationally, silent degradation also damages observability. A caller may receive apparently successful output with no durable signal that the intended algorithm failed. Monitoring sees completion, automated retries do not trigger, and downstream systems cannot distinguish verified plaintext from output produced by a compatibility path.

Testing-only behavior is especially risky when it shares production code. Environment flags, exception handlers and optional dependencies can make a path seem unreachable during review yet activate it after packaging or runtime drift. The right invariant is simpler: failed authentication, failed decapsulation and unavailable cryptographic prerequisites must produce explicit failure.

## Turn the advisory into inventory

Start by checking software bills of materials, Python lockfiles, container layers and internal tools for the PyPI package name `openssl_encrypt`. Do not confuse it with the OpenSSL library: the CVE records name a separate Python package maintained under the `jahlives` repository. That naming distinction is important for avoiding both missed findings and noisy false positives.

Where the package exists, identify whether affected functions are used rather than inferring exposure from installation alone. Record the deployed package version, image digest and process environment. Upgrade affected deployments to 1.4.0 or later, using the project's stable release rather than a moving development branch, then rebuild and restart the consuming workload.

Version metadata is not completion evidence. Confirm the imported package path and version inside the same runtime that handles encrypted material. For vendored or forked copies, compare behavior and relevant fixes because the package manager may not see them. Preserve encrypted backups before changing formats, and validate read compatibility on non-production samples; the 1.4.0 release notes say older formats remain readable while newer output may require 1.4.0 or later.

## Prove failure stays closed

The most useful acceptance tests are negative. Corrupted authentication tags, invalid encapsulated material, unavailable cryptographic backends and malformed inputs should all return explicit errors, produce no plaintext, and avoid writing partial output. Tests should also confirm that compatibility options cannot silently reactivate simulation or unauthenticated modes in production builds.

Log the failure category without recording keys, ciphertext or plaintext. Alert on repeated cryptographic validation failures, but treat them as evidence for investigation—not proof of attack. Finally, add these cases to release gates so a future refactor cannot trade integrity for apparent resilience.

The broader lesson is durable: cryptographic agility should permit deliberate, policy-approved algorithm transitions before an operation begins. It should never mean improvising a weaker mode after verification has already failed.
