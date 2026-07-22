---
title: "IxChariot Updates Close Remote Code Paths in Network Test Systems"
subtitle: "Keysight's advisory turns overlooked test endpoints and probes into an immediate version-verification task."
description: "Keysight fixed critical and high-severity flaws across IxChariot, Hawkeye and network probes. Defenders should inventory and verify every deployment."
date: 2026-07-22 07:08:47 +0400
layout: post
category: defense
tags: [network-testing, vulnerability-management, patch-management, asset-inventory]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-22-ixchariot-updates-close-remote-code-paths.svg
image_alt: "Abstract network-test signals passing through a faceted cyan shield while isolated amber nodes remain outside its protection"
key_points:
  - "Keysight disclosed one critical and two high-severity code-execution vulnerabilities affecting network test software."
  - "The critical issue reaches IxChariot Endpoint, Hawkeye and several network probe products below fixed versions."
  - "Defenders should verify deployed versions and search specifically for test infrastructure that normal inventories may miss."
sources:
  - title: "Security Advisory: IxChariot Vulnerability CVE-2026-49435, CVE-2017-20242, CVE-2017-20241"
    publisher: "Keysight · July 21, 2026"
    url: "https://www.keysight.com/gb/en/about/quality-and-security/security/product-and-solution-cyber-security/security-advisory-archive/security-advisory--ixchariot-vulnerability.html"
---

Keysight published a security advisory on July 21 for three vulnerabilities in its network testing software: one critical issue, CVE-2026-49435, and two high-severity issues, CVE-2017-20242 and CVE-2017-20241. The practical priority is broader than updating a single application. Defenders need to find endpoints and probes that may sit outside routine production-software inventories, then prove that each one is on a fixed release.

## The exposure spans more than IxChariot

Keysight says the three issues could permit arbitrary code execution without user interaction or privileges. That describes potential technical impact, not observed attacks: the company says it is not aware of malicious exploitation.

The two older CVEs affect IxChariot Endpoint versions earlier than 9.5.102. Keysight says it resolved those defects in 2017 as part of standard product maintenance, when they were treated as functional bugs rather than security vulnerabilities. Version 9.5.102, released on August 11, 2017, is the stated mitigation for both.

The newly identified critical issue has a wider footprint. CVE-2026-49435 affects IxChariot Endpoint before 10.0.254, Hawkeye before 6.0.7, and IxProbe, IxTap and IxByPass before 3.13.0. Keysight lists 10.0.254, 6.0.7 and 3.13.0 respectively as the fixed releases. Those updates were available before the advisory: April 30 for IxChariot Endpoint and June 26 for Hawkeye and the probe products.

## Test infrastructure creates an inventory blind spot

Network performance tools are easy to misclassify as temporary. An endpoint may have been installed for a capacity exercise and left behind; a probe may belong to a lab team but remain connected to a routed management network; an appliance may be known by hardware name while its embedded software disappears from the software inventory.

That makes discovery the first control. Security teams should search endpoint-management records for the product names in the advisory, but should not stop there. Procurement records, license servers, lab documentation, network-management segments and owners of performance-testing workflows can reveal installations that a conventional application scan misses. The aim is to build a deployment list that includes dormant systems and retained images, not just currently active consoles.

The distinction between product families also matters. A query for IxChariot alone will not identify Hawkeye or the named probes affected by CVE-2026-49435. Inventory logic should therefore map all five product names to their required fixed versions and record the accountable owner for each instance.

## Version evidence should drive the response

Keysight recommends upgrading to the latest software and discontinuing older versions. For defenders, the minimum useful evidence is the version actually installed on every discovered system, compared with the relevant fixed release. A successful deployment job or a downloaded installer is not enough.

Prioritize systems reachable from untrusted or broadly accessible networks, followed by management interfaces shared across teams and test assets that can communicate with production environments. Where an update cannot be completed immediately, reduce unnecessary network reachability and restrict access to approved administrators. Those are temporary exposure controls; they do not correct the vulnerable code.

After updating, rescan the asset and confirm that the running service or endpoint reports the intended version. Retained virtual-machine templates, golden images and recovery media also need review, or a future restore could reintroduce the old build. If a product is no longer required, removal is cleaner than preserving an unmanaged exception.

## Old fixes still need modern security tracking

The two 2017 defects offer a useful governance lesson. A functional repair can later acquire a security identity, while systems that missed the original maintenance release remain exposed. Vulnerability programs should therefore be able to correlate a newly assigned CVE with historical product versions rather than assuming every new identifier requires a newly released patch.

This advisory is ultimately a test of evidence. Teams should be able to show where the affected network-test products exist, which fixed version applies to each, and whether the running deployment reached it. Closing that gap strengthens more than this patch cycle: it brings short-lived tools, lab systems and embedded probes back inside the same ownership and verification discipline as production software.
