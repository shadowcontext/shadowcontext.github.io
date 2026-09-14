---
title: "Internet Download Manager Driver Flaw Demands Version Proof"
subtitle: "A newly disclosed Windows driver weakness makes the loaded component—not the application label—the unit of remediation."
description: "CVE-2026-90493 affects an Internet Download Manager kernel driver; defenders should update, verify the loaded driver, and reduce local privilege paths."
date: 2026-09-14 16:11:24 +0400
layout: post
category: defense
tags: [windows-security, vulnerability-management, kernel-drivers, endpoint-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-14-idm-driver-flaw-needs-version-proof.svg
image_alt: "Abstract editorial illustration of download streams crossing a guarded boundary into a protected Windows kernel layer"
key_points:
  - "CVE-2026-90493 describes improper access controls in the idmwfp.sys kernel driver through Internet Download Manager 6.42 Build 63."
  - "The flaw requires local, low-privileged access, but the CVE record says no user interaction is needed and a public exploit exists."
  - "Defenders should move beyond the affected range and verify the installed package and loaded driver rather than trust an update prompt alone."
sources:
  - title: "Tonec Internet Download Manager Kernel Driver idmwfp.sys access control"
    publisher: "CVE Program · September 13, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/90xxx/CVE-2026-90493.json"
  - title: "Internet Download Manager News and Updates"
    publisher: "Internet Download Manager · August 20, 2026"
    url: "https://www.internetdownloadmanager.com/news.html"
  - title: "Driver security checklist"
    publisher: "Microsoft Learn · February 26, 2025"
    url: "https://learn.microsoft.com/en-us/windows-hardware/drivers/driversecurity/driver-security-checklist"
---

A newly published vulnerability record puts attention on a component that ordinary software inventories can hide: a Windows kernel driver installed by a desktop application. CVE-2026-90493 describes improper access controls in `idmwfp.sys`, part of Internet Download Manager. The immediate defensive task is to find affected installations, move them beyond the named version range, and prove that the old driver is no longer active.

## What the record confirms

The CVE Program record was published on September 13 and identifies Internet Download Manager on Windows through version 6.42 Build 63 as affected. It assigns the weakness to improper access controls and incorrect privilege assignment in the kernel-driver component. Its severity data describes a local attack requiring low privileges, low complexity, and no user interaction, with high potential impact across confidentiality, integrity, and availability.

The record also states that an exploit is public. That raises the priority of remediation, but it does not establish active exploitation or any affected organization. Defenders should keep those distinctions intact: this is a vulnerability advisory with a plausible local privilege-escalation consequence, not evidence of a campaign or compromise.

The affected boundary is specific. It does not say every release of the product is vulnerable, nor does it identify a particular fixed build. That precision matters when translating a database record into an endpoint action.

## Treat the driver as the asset

Internet Download Manager’s public release history lists 6.42 Build 64 in May and several 6.43 builds after that, with 6.43 Build 10 dated August 20. Those releases are newer than the CVE’s affected range. However, the release notes do not connect a build to CVE-2026-90493 or describe a security correction for `idmwfp.sys`. The defensible conclusion is therefore narrow: systems at or below 6.42 Build 63 should move beyond the affected range, while teams should avoid claiming that a particular later build is the vendor-confirmed fix.

Inventory both the application and its driver. Software-management data can show the package version, but the security boundary is the driver that Windows can load. Record the application version, the installed `idmwfp.sys` file version and signature, the driver-service state, and whether a reboot is pending. A successful installer exit or an updated browser extension does not prove that the kernel component changed.

Prioritize shared workstations, administrative endpoints, jump hosts, and systems where untrusted users or processes can obtain a local foothold. The vulnerability is not remotely reachable on its own according to the published vector, but local elevation can turn a constrained account into a much more consequential position.

## Remediate without guessing

Use the vendor’s normal update channel to install a release newer than the affected range, then reboot if the deployment requires it. Afterward, recheck the running application and loaded driver rather than relying on package inventory alone. If an endpoint cannot be updated promptly, removing the application is cleaner than assuming that disabling its user interface also prevents the driver from loading. Where removal is not operationally possible, restrict local sign-in and application execution, and keep privileged credentials away from the host until the exposure is resolved.

Microsoft’s driver-security guidance explains why this deserves more weight than a routine desktop bug: kernel drivers execute inside the operating system’s most trusted boundary. Microsoft recommends strict access controls for device objects and individual I/O controls, together with least privilege. Those are design obligations for vendors, but they also give defenders a useful rule: software that installs a kernel component needs a higher assurance standard in procurement, inventory, and update validation.

## Close on evidence

Do not close the issue merely because the product reports a current version. Capture evidence after restart that the affected package range is absent and the expected signed driver is the one loaded. Monitor the CVE record and vendor release notes for an explicit remediation statement; if one appears, reconcile it with the deployed file evidence and adjust the approved version floor.

The durable lesson is that application names are poor proxies for kernel risk. A complete remediation record connects the advisory’s affected component to the exact binary installed, the driver Windows actually loaded, and the control that prevents an older copy from returning.
