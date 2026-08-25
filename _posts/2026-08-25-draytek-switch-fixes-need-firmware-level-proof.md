---
title: "DrayTek Switch Fixes Need Firmware-Level Proof"
subtitle: "A 29-CVE VigorSwitch advisory makes exact model mapping and verified firmware state more useful than headline severity."
description: "DrayTek fixed 29 VigorSwitch vulnerabilities across defined models, requiring exact inventory, controlled management access, and firmware verification."
date: 2026-08-25 21:08:35 +0400
layout: post
category: defense
tags: [network-security, vulnerability-management, firmware, network-switches]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-25-draytek-switch-fixes-need-firmware-level-proof.svg
image_alt: "Abstract network switch protected by layered cyan firmware rings while segmented traffic paths stop at an amber management boundary"
key_points:
  - "DrayTek’s advisory covers 29 CVEs across a specific set of VigorSwitch models."
  - "The vendor reports no demonstrated practical attack path, while one CVE record describes pre-authentication command injection."
  - "Defenders should update by exact model and retain evidence from the running firmware state."
sources:
  - title: "Multiple Vulnerabilities in VigorSwitch Series"
    publisher: "DrayTek · August 24, 2026"
    url: "https://www.draytek.com/about/security-advisory/multiple-vulnerabilities-in-vigorswitch-series-august-2026/"
  - title: "NVD - CVE-2026-71921"
    publisher: "NIST National Vulnerability Database · August 24, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2026-71921"
---

DrayTek has released firmware updates for a defined group of VigorSwitch models after confirming 29 vulnerabilities in affected code. The August 24 advisory spans command injection, null-pointer dereference, directory traversal, missing authorization and buffer-overflow findings.

The practical task is more precise than reacting to a large CVE count. Network teams need to match each physical switch to the vendor’s model-specific fixed version, control the management path during rollout and prove that the corrected firmware is actually running.

## A broad advisory with a bounded scope

DrayTek’s DSA-2026-003 lists CVE-2026-71915 through CVE-2026-71943. It says the conditions were found in the VigorSwitch `mainfunction.cgi` component and confirms that updated firmware addresses them. The affected list includes selected G, P, Q, PQ, FX and PX series switches; DrayTek explicitly says no other models are affected.

The fixed baseline is not one universal version. G2540xs, P2540xs and FX2120 move to 3.9.10; G2282x and P2282x to 2.10.6; Q2300x and PQ2300xb to 2.10.7; G2542x, P2542x and P2542xh to 3.10.6. The remaining models named in the advisory move to 2.9.10.

That variation makes a generic “DrayTek patched” ticket inadequate. Teams should export switch inventory from management systems, reconcile it with rack and procurement records, and attach the required fixed version to each serialised asset. Similar product names are not proof of applicability, and a downloaded firmware file is not proof of installation.

## Record the uncertainty without diluting the response

The vendor says the code conditions are confirmed but that it knows of no documented trigger, practical attack path or evidence of exploitation in deployed environments. It adds that a viable path would likely require valid administrator credentials and access to the web management interface. Potential arbitrary code execution remains conditional in DrayTek’s account.

The newly published NVD entry for CVE-2026-71921 carries a materially different description supplied by the CVE source. It characterises the issue as pre-authentication command injection in `setget.cgi`, remotely reachable through crafted input, and displays source-provided critical scores. NVD had not yet supplied its own assessment when reviewed.

Defenders should preserve both statements rather than silently choosing the more convenient one. The discrepancy does not establish exploitation, and it does not justify postponing the vendor update. It does justify treating management-interface reachability as an immediate control question while the records may evolve. Track the advisory and CVE record for revisions, and note which version of each source informed the change decision.

## Secure the management path during rollout

Before maintenance, confirm that switch web administration is not exposed to the public internet or broad user networks. Restrict it to designated administration segments and managed operator endpoints. Where central management is required, allow only the necessary source addresses and protocols, and remove temporary access after the change window.

Administrative credentials should be unique, stored in an approved secrets system and rotated when access history or account ownership cannot be established. Those steps reduce dependence on the vendor’s current exploitability assumptions, but they do not replace firmware installation.

Stage updates with configuration backups and a recovery plan appropriate to the site. A switch reboot can affect far more than its own management session, so map uplinks, redundant paths, power dependencies and out-of-band access before scheduling. Test a representative model first where the environment permits, then sequence the remaining devices to preserve connectivity.

## Close with running-state evidence

After each update, query the device again and capture its model, serial number and running firmware version. Confirm management reachability from an authorised path, then test that a disallowed segment cannot reach the interface. Check that expected VLANs, trunks, access controls, monitoring and time synchronisation survived the change.

Exceptions need an owner, compensating control and expiry date. If a listed switch cannot be updated immediately, isolate its management plane, narrow administrator access and schedule replacement or vendor-assisted remediation rather than leaving “not internet-facing” as the entire risk decision.

The durable lesson is that firmware advisories are asset-state problems. A CVE list starts the work; exact model mapping, constrained administration and evidence from the running switch are what finish it.
