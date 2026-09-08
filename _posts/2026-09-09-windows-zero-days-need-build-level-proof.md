---
title: "Exploited Windows Flaws Need Build-Level Patch Proof"
subtitle: "Two local privilege-escalation flaws turn September's Windows rollout into an evidence problem, not merely a deployment task."
description: "Two exploited Windows privilege-escalation flaws make patch coverage, build verification, and exception handling immediate defensive priorities."
date: 2026-09-09 02:12:51 +0400
layout: post
category: defense
tags: [Windows, vulnerability management, endpoint security, patching]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-09-windows-zero-days-need-build-level-proof.svg
image_alt: "Abstract endpoint tiles protected by a luminous update shield that blocks an amber path toward a raised privilege layer"
key_points:
  - "Microsoft identified two September Windows privilege-escalation flaws as exploited."
  - "The affected release families differ, so one fleet-wide patch claim is insufficient."
  - "Defenders should prove installed builds and give every exception an owner and deadline."
sources:
  - title: "Windows Update Stack Elevation of Privilege Vulnerability"
    publisher: "Microsoft Security Response Center · September 8, 2026"
    url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-81963"
  - title: "Windows Advanced Local Procedure Call (ALPC) Elevation of Privilege Vulnerability"
    publisher: "Microsoft Security Response Center · September 8, 2026"
    url: "https://msrc.microsoft.com/update-guide/vulnerability/CVE-2026-85880"
  - title: "Microsoft security advisory – September 2026 monthly rollup (AV26-896) – Update 1"
    publisher: "Canadian Centre for Cyber Security · September 8, 2026"
    url: "https://www.cyber.gc.ca/en/alerts-advisories/microsoft-security-advisory-september-2026-monthly-rollup-av26-896"
  - title: "September 8, 2026—KB5124008 (OS Builds 26200.9445 and 26100.9445)"
    publisher: "Microsoft Support · September 8, 2026"
    url: "https://support.microsoft.com/en-us/servicing/os/windows-11/2026/09/kb5124008-windows-11-24h2-25h2-security-update"
---

Microsoft's September security release includes fixes for two Windows elevation-of-privilege vulnerabilities that the company identifies as exploited. The Canadian Centre for Cyber Security says CISA added both to its Known Exploited Vulnerabilities catalog on September 8.

That combination changes the operating question. Defenders do not need to infer which campaign may be involved; neither Microsoft advisory publicly supplies that context. They do need to establish which Windows release families are exposed, deploy the applicable cumulative updates, and prove that endpoints reached the intended build.

## Two flaws, two different component boundaries

CVE-2026-81963 affects the Windows Update Stack. Microsoft describes it as improper link resolution before file access that can let an authorized attacker elevate privileges locally. The advisory assigns a CVSS 3.1 base score of 7.8 and lists affected editions across Windows 11 and Windows Server 2025.

CVE-2026-85880 is in Windows Advanced Local Procedure Call, or ALPC. Microsoft describes a heap-based buffer overflow that can allow an authorized local attacker to elevate privileges. It also carries a CVSS 3.1 base score of 7.8, but its affected-product table reaches different Windows client and server generations, including supported or extended-support deployments of older releases.

Both are local privilege-escalation flaws. That does not mean they are low priority. A local path generally requires an attacker to have some initial ability to run or influence activity on a device, but successful elevation can defeat the separation between a constrained account and higher-impact system privileges. Microsoft has not published a campaign narrative in the two advisories, so defenders should avoid inventing an entry vector or linking the flaws to unrelated incidents.

## Inventory by release, architecture and servicing state

A single dashboard total such as “Windows patched” is too coarse. The two Microsoft advisories list product-specific security updates, while cumulative-update eligibility depends on the operating-system version, architecture and support channel. Unsupported devices and systems enrolled in extended support also need to remain visible rather than disappearing from the compliance denominator.

Build the deployment population from endpoint telemetry, configuration management and update-service records. Group systems by exact release and architecture, then map each group to Microsoft's affected-product table and the corresponding cumulative update. Include powered-off laptops, paused virtual machines, golden images, recovery environments and server templates. These dormant assets can return after the main rollout and recreate an older security state.

For Windows 11 versions 24H2 and 25H2, Microsoft Support identifies KB5124008 and OS builds 26100.9445 and 26200.9445 respectively. Those values are useful verification targets for those editions, not universal targets for every Windows device. Other release families require their own entries from Microsoft's advisory tables.

## Prove the running state, not the approval state

Update approval, download and installation are different events. A deployment report should show the device's observed post-update build and the time it was last checked. Sample high-value systems independently, especially administration workstations, identity-management endpoints, jump hosts and servers whose local privilege boundary protects sensitive services.

Failures need explicit handling. Record the error, retry status, owner, business reason and next action for each exception. If an update cannot be installed promptly, reduce exposure with controls appropriate to the system: restrict interactive access, minimize local accounts, limit who can execute software, and increase monitoring for unexpected privileged processes or account changes. These are risk-reduction measures, not substitutes for Microsoft's fixes.

Rollback planning matters too. Test the cumulative updates against critical applications, but keep emergency testing time-boxed because exploitation evidence raises the cost of delay. Preserve recovery keys and operational recovery procedures before broad deployment, and confirm that rollback decisions cannot silently leave a device counted as compliant.

## Close the gap with durable evidence

The cleanest completion record ties four facts together: an in-scope asset, the applicable Microsoft update, an observed compliant build, and a recent check time. Fleet owners should retain that evidence alongside a list of unresolved exceptions and revisit it when dormant systems reconnect.

These vulnerabilities reinforce a practical distinction: patching is an action, while remediation is a verified state. With exploited privilege-escalation flaws, the defensible finish line is not that an update was released or approved. It is that every applicable device is demonstrably on the corrected build—or is visibly contained, owned and scheduled for resolution.
