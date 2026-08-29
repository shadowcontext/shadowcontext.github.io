---
title: "Dovecot 2.4.5 needs feature-level proof"
subtitle: "A wide security release makes protocol, proxy, and storage settings part of patch verification."
description: "Dovecot 2.4.5 fixes authentication, IMAP, Sieve, proxy, and resource flaws; defenders should verify both the running build and active features."
date: 2026-08-29 10:08:21 +0400
layout: post
category: defense
tags: [dovecot, email-security, vulnerability-management, patching]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-29-dovecot-2-4-5-needs-feature-level-proof.svg
image_alt: "Abstract encrypted mail stream passing through layered protocol gates and a central shield"
key_points:
  - "Dovecot and Pigeonhole 2.4.5 address flaws across authentication, IMAP, Sieve, proxying, and resource controls."
  - "Several fixes matter only when particular features or trusted paths are enabled, so configuration belongs in exposure triage."
  - "One IMAP threading fix also requires a storage-version change and index rebuild, making post-update validation essential."
sources:
  - title: "Dovecot and Pigeonhole v2.4.5 released"
    publisher: "Dovecot · August 28, 2026"
    url: "https://dovecot.org/mailman3/archives/list/dovecot-news@dovecot.org/thread/D7FJQODYCY23BG3FWUZXCJRCLCPT7RZT/"
---

Dovecot and Pigeonhole 2.4.5 arrived on August 28 with a broad set of security corrections spanning mail parsing, authentication, IMAP, Sieve, proxy trust, compression, and resource consumption. The operational message is not simply “upgrade the mail server.” Defenders need to prove which features are active, whether the corrected release is running everywhere, and whether a configuration-dependent fix has actually taken effect.

## One release, several security boundaries

The project’s release announcement lists vulnerabilities with different prerequisites and consequences. CVE-2026-42391 concerns excessive memory or CPU use before IMAP authentication. CVE-2026-40019 affects the ManageSieve login process before authentication and can cause an infinite loop. Those issues put availability controls at the public protocol edge, where a small amount of hostile input may consume shared process capacity.

Other fixes sit deeper in authenticated or trusted paths. CVE-2026-40205 corrects partial enforcement of required OAuth scopes in certain configurations. CVE-2026-42395 addresses a crash reachable through XCLIENT FORWARD from networks configured as trusted. CVE-2026-42007 concerns a memory-safety error in the Sieve `editheader` extension and requires valid credentials. CVE-2026-52681 fixes a way to reset tracked Sieve CPU usage by switching the active binary.

This range matters for triage. An internet-facing IMAP listener, a ManageSieve service limited to an administration network, and a proxy tier that accepts forwarding metadata from trusted addresses do not present the same exposure. A single package version can therefore represent several distinct security decisions.

## Configuration determines the real patch surface

Teams should map the release notes to deployed behavior before assigning urgency. Record whether IMAP compression is enabled and which algorithms are offered; whether URLAUTH, IMAP hibernation, login proxying, OAuth, Sieve, and the `editheader` extension are in use; and which networks are allowed to supply trusted forwarding information. Disabled features reduce immediate reachability, but they should not become a reason to leave a vulnerable build in place.

The release also changes defensive defaults. Pigeonhole now gives `sieve_max_cpu_time` a global 30-second default for current configuration versions, limits notification actions per script by default, and places default limits on recipients and extra headers for `mailto:` notifications. Dovecot’s HTTP request parser now rejects obsolete line folding and bare line-feed terminators because both can create request-desynchronization risk. These are useful hardening changes, yet teams must check whether inherited configuration-version behavior preserves older defaults.

Inventory should include package provenance as well as the application’s own reported version. Distribution packages may carry backported patches without matching upstream numbering, while containers or locally built binaries may bypass the normal operating-system inventory. The defensible record is the running artifact, its source, its configuration, and the listener or workload it serves.

## One fix needs more than a binary update

CVE-2026-40017 is the clearest warning against version-only closure. The project says the IMAP THREAD fix requires a new `dovecot.index.thread` format that becomes active only after setting `dovecot_storage_version` to the required level or newer. Enabling it rebuilds the index, with expected additional CPU and metacache disk I/O.

That makes rollout sequencing important. Administrators should test the configuration transition on representative mailboxes, estimate index-rebuild load, preserve rollback plans, and watch latency, CPU, disk activity, process restarts, and authentication failures during deployment. A successful package transaction does not prove the new index format is active or that mail access remains healthy.

The release announcement also says no new dependencies were added, but notes repository distribution changes: Ubuntu 22.04 packages are no longer provided by the project repository, while Ubuntu 26.04 support was added. Organizations still on the removed repository target should resolve their supported packaging path rather than treating the absence of a familiar package as evidence that no action is required.

## Close with evidence, not an update ticket

A sound response has three layers. First, identify every Dovecot and Pigeonhole instance, including proxies, containers, migration tooling, and standby nodes. Second, connect enabled features and trusted-network settings to the relevant fixes, prioritizing unauthenticated listeners and shared-process availability risks. Third, deploy a corrected vendor or distribution build and verify the running process, effective configuration, storage-format transition, and service health.

The breadth of 2.4.5 is exactly why a generic “patched” status is weak evidence. Mail infrastructure combines protocol parsers, authentication policy, user-controlled content, trusted proxy metadata, and long-lived indexes. Defenders reduce uncertainty when each of those boundaries has an owner and a post-change check.
