---
title: "Armoury Crate Fixes Need Driver-Level Proof"
subtitle: "Three new flaws show why an updated control app is not enough without evidence from its loaded kernel driver."
description: "Three Armoury Crate flaws expose a weak driver boundary; defenders should update beyond 6.5.7 and verify the corrected driver is loaded."
date: 2026-09-08 18:12:04 +0400
layout: post
category: defense
tags: [vulnerability-management, endpoint-security, windows-drivers, access-control]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-08-armoury-crate-fixes-need-driver-level-proof.svg
image_alt: "Abstract blue endpoint core with a protected driver ring filtering amber hardware-control signals before they reach layered circuitry"
key_points:
  - "Three new CVEs affect Armoury Crate versions through 6.5.7."
  - "The flaws let a low-privileged local user bypass checks on sensitive driver requests."
  - "Closure requires proof of the installed app version and the driver actually loaded after restart."
sources:
  - title: "CVE-2026-16004"
    publisher: "CVE Program · ASUS · September 8, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/16xxx/CVE-2026-16004.json"
  - title: "CVE-2026-16005"
    publisher: "CVE Program · ASUS · September 8, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/16xxx/CVE-2026-16005.json"
  - title: "CVE-2026-16006"
    publisher: "CVE Program · ASUS · September 8, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/16xxx/CVE-2026-16006.json"
  - title: "ASUS Product Security Advisory"
    publisher: "ASUS · accessed September 8, 2026"
    url: "https://www.asus.com/security-advisory/"
---

ASUS has published three Armoury Crate vulnerability records that converge on one defensive problem: a user-space application can be current while a sensitive kernel driver remains the real security boundary. All three issues concern local requests to the driver, and all list Armoury Crate versions through 6.5.7 as affected.

The disclosures do not report active exploitation or an organizational breach. They do give endpoint teams a concrete task: update the software, restart where required, and prove that the corrected driver—not just a newer interface—is running.

## Three paths through one boundary

CVE-2026-16004 describes insufficient access control around input/output control requests, or IOCTLs. According to the ASUS-assigned CVE record, a low-privileged local user could bypass the driver's verification and read or write arbitrary PCI or PCIe configuration space. ASUS scores it 5.9 under CVSS 4.0, with high potential impact to integrity and availability and low impact to confidentiality.

CVE-2026-16005 reaches a different operation through the same class of request. The record says a local user could bypass verification and cause the driver to free arbitrary memory. That could corrupt data structures and crash Windows with a blue screen. ASUS assigns a CVSS 4.0 score of 5.8 and identifies high integrity and availability impact.

CVE-2026-16006 concerns information exposure. A crafted driver request could reveal kernel virtual addresses, giving a low-privileged local user more insight into the kernel's memory layout. ASUS scores this issue 5.7, with high confidentiality impact.

These are separate weaknesses, not three names for an identical outcome. Their common feature is more useful operationally: software with kernel reach was not adequately distinguishing an authorized hardware-control request from one supplied by a local user who should not have that authority.

## Local does not mean harmless

The records describe local attack paths, high attack complexity and low privileges. They do not describe remote, unauthenticated compromise. That should calibrate prioritization, but it should not reduce the issue to ordinary application risk.

A driver runs at a privileged layer and mediates access to hardware and kernel state. A boundary failure there can turn a foothold with limited rights into an ability to affect configuration, memory or system availability. The correct defensive inference is modest: these flaws may add consequence to local code execution; the records do not establish a standalone remote entry path or a working exploit chain.

Prioritize shared gaming workstations, build machines, lab systems and other endpoints where untrusted code may run under standard user accounts. Devices used only by a single trusted operator may present a different exposure profile, but their installed state should still be known rather than assumed.

## Prove the driver changed

Inventory Armoury Crate across managed Windows endpoints and identify installations at version 6.5.7 or earlier. Use ASUS's supported update mechanism to move beyond the affected range. Where the organization does not need the software, removal can reduce attack surface, but only after confirming that the change will not disrupt required device management.

Validation should happen at two levels. First, record the installed Armoury Crate version from the endpoint itself. Second, confirm after a restart that the expected driver file and version are loaded. An installer success event, package-manager status or newly rendered application screen does not independently prove that Windows stopped using an older in-memory driver.

Treat failed restarts, machines that were offline during deployment and systems restored from older images as explicit exceptions. Recheck them before closing the remediation ticket. Endpoint controls should also prevent ordinary users from installing arbitrary drivers and should retain driver-load telemetry where the platform supports it.

## Turn remediation into durable evidence

The closure record should connect device identity, pre-update version, deployment time, restart state and post-update driver evidence. That makes the result auditable and helps detect rollback after repair or image restoration.

Finally, keep the severity in proportion. ASUS's records rate these issues medium and require an existing low-privileged local user. The reason to act is not a claim of emergency exploitation; it is that kernel-facing utilities deserve stronger proof than an application inventory alone can provide. For this update, the most meaningful green status is a corrected driver loaded on every in-scope endpoint.
