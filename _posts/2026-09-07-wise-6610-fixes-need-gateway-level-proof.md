---
title: "WISE-6610 fixes need gateway-level proof"
subtitle: "Two critical command-injection flaws make precise firmware inventory and controlled upgrades the priority for industrial gateway owners."
description: "New WISE-6610 command-injection disclosures require exact model checks, a staged firmware upgrade, and tighter management-path controls."
date: 2026-09-07 19:11:53 +0400
layout: post
category: defense
tags: [industrial-iot, vulnerability-management, gateways, firmware]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-07-wise-6610-fixes-need-gateway-level-proof.svg
image_alt: "Abstract industrial gateway surrounded by layered blue network paths, with two amber command streams stopped at a protected firmware core"
key_points:
  - "Two new critical CVEs affect management functions in the WISE-6610 V2 family."
  - "The published records identify firmware 1.2.1_20251110 as affected and 1.2.4_20260821 as fixed."
  - "Defenders should pair a staged upgrade with management-plane isolation and post-update verification."
sources:
  - title: "CVE-2026-79697"
    publisher: "CVE Program · September 7, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-79697"
  - title: "CVE-2026-79698"
    publisher: "CVE Program · September 7, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-79698"
  - title: "Firmware for WISE-6610 V2 (WISE-6610-XB / WISE-6610-EL-XB)"
    publisher: "Advantech · September 2, 2026"
    url: "https://www.advantech.com/en-us/support/details/firmware?id=1-2K7AXRI"
---

Two critical vulnerability records published on September 7 put a narrow but consequential task in front of operators of Advantech WISE-6610 V2 industrial gateways: identify the exact devices and firmware in service, then move affected units to the vendor's fixed build through a controlled maintenance process. The lesson is less about a score than about proving that every gateway at an operational boundary reached the intended state.

## What the records establish

The CVE Program records describe CVE-2026-79697 and CVE-2026-79698 as command-injection vulnerabilities in the WISE-6610 V2 family. The first concerns the Basic Station certificate-deletion handler; the second concerns the Node-RED library function. Both are described as remotely reachable, requiring low privileges and no user interaction. Their CVSS 3.1 base score is 9.9.

The affected list spans WISE-6610 regional variants, including NB, EB, TB, JB and CB models, corresponding EL variants, and three WISE-6610P variants. Both records identify firmware build 1.2.1_20251110 as affected and 1.2.4_20260821 as unaffected. They also say public exploit material exists. That last point raises the cost of delay, but it does not establish exploitation against any deployment; the records provide no such claim.

The two flaws sit in different management functions. Defenders therefore should not treat the work as disabling one optional feature and declaring the device safe. The confirmed remedy in the records is the fixed firmware build. Exposure reduction is useful while upgrades are prepared, but it is a supporting control rather than a substitute for remediation.

## Inventory must be exact

Industrial gateways are easy to miss when vulnerability work begins from server and endpoint tooling. Build an explicit list from network-management records, asset registers, procurement data and site documentation. Record the complete model suffix, installed firmware build, physical or operational location, management address, responsible owner and maintenance constraint. A family name alone is not enough to demonstrate coverage.

Then reconcile that list with observed devices. Look for gateways that are managed through shared engineering networks, reachable from broader enterprise segments, or absent from central monitoring. Prioritize any affected unit whose administrative interface can be reached from an untrusted or unnecessarily large network zone. Do not infer safety merely because the device is not directly internet-facing; internal access paths and vendor-support routes still define its practical exposure.

The goal is a closed set of devices with an accountable disposition: updated, scheduled with a temporary restriction, confirmed not affected, or formally accepted as an exception. Unknown firmware should remain an open security finding, not be counted as compliant.

## Stage the firmware change

Advantech's support page lists WISE-6610_v1.2.4_20260821 for WISE-6610 V2 and includes special instructions for devices moving from firmware 1.0.15 or older. Those instructions call for a DTB upgrade, a factory reset and restart with a clean configuration; restoring the original configuration is not recommended in that case. This is operationally important because a security update may become a configuration-rebuild exercise for older units.

Test the process on a representative non-production gateway or spare. Preserve the information needed to rebuild approved settings, but follow the vendor's model-specific instructions rather than automatically restoring a backup. Confirm power stability, local recovery access and an acceptable service window. Sites should also validate communications with upstream platforms and downstream field devices after the reboot.

Obtain firmware through the vendor support channel and verify that the selected image matches the exact hardware. The vendor page warns that firmware intended for another device can damage the unit. Where download access is tied to a device barcode, make that access part of the maintenance plan instead of discovering the dependency during an outage window.

## Prove the boundary after updating

Completion evidence should include the running build reported by the device, a successful reboot, expected configuration, restored telemetry and a functional check of required industrial communications. Capture that evidence against the asset record so a package download or change ticket is not mistaken for deployment proof.

Finally, reduce the management plane to named administration networks, remove unnecessary routes, and review accounts and remote-support paths. Monitor rejected connection attempts and configuration changes at the gateway boundary. These controls limit future management-function exposure and make unexpected access more visible. For this disclosure, the defensible end state is simple: every in-scope gateway is identified, correctly updated, operationally tested and reachable only through an intentional administrative path.
