---
title: "WHMCS Fixes Make Billing Portals an Immediate Patch Boundary"
subtitle: "Two unauthenticated flaws make exact version evidence and legacy-system retirement urgent defensive tasks."
description: "WHMCS fixed unauthenticated data-access and code-execution flaws; defenders should update supported releases and retire exposed legacy versions."
date: 2026-09-04 06:11:36 +0400
layout: post
category: defense
tags: [WHMCS, vulnerability-management, web-security, patching]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-04-whmcs-fixes-need-billing-boundary-proof.svg
image_alt: "Abstract billing portal layers protected by a luminous version boundary, with payment and customer-data paths separated from external signals"
key_points:
  - "WHMCS 8.x before 8.13.7 and 9.x before 9.0.8 require immediate updates."
  - "One flaw affects the 2CheckOut module, while a separate flaw can enable unauthenticated server code execution."
  - "Defenders should verify the running application version and remove unsupported internet-facing installations."
sources:
  - title: "CVE-2026-67398 - WHMCS Security Update 2026-09-03"
    publisher: "WHMCS · September 3, 2026"
    url: "https://help.whmcs.com/m/125386/l/2116695-cve-2026-67398-whmcs-security-update-2026-09-03"
  - title: "CVE-2026-67399 - WHMCS Security Update 2026-09-03"
    publisher: "WHMCS · September 3, 2026"
    url: "https://help.whmcs.com/m/125386/l/2118034-cve-2026-67399-whmcs-security-update-2026-09-03"
  - title: "8.13 Change Log"
    publisher: "WHMCS Documentation · September 3, 2026"
    url: "https://docs.whmcs.com/releases/8-13/8-13-change-log/"
  - title: "9.0 Change Log"
    publisher: "WHMCS Documentation · September 3, 2026"
    url: "https://docs.whmcs.com/releases/9-0/9-0-change-log/"
---

WHMCS has released fixes for two vulnerabilities that cross important boundaries in self-hosted billing installations. One can expose customer information through a payment-gateway component; the other can permit unauthenticated code execution on the server. The shared defensive priority is clear: update supported branches, prove the new version is running, and do not leave legacy installations exposed while assuming that a disabled integration resolves both issues.

## What the vendor disclosed

WHMCS says CVE-2026-67398 affects WHMCS 4.5.0 and later through its 2CheckOut payment gateway module. Under specific conditions, an unauthenticated user could retrieve a client's personally identifiable information, including name, address, city, state, postal code, country, email address and phone number. The vendor lists 8.13.7 and 9.0.8 as fixed releases.

The same update also addresses CVE-2026-67399, a separate vulnerability affecting WHMCS 8.0.x and later. WHMCS describes the issue as insufficient restriction of forged payloads and says an unauthenticated user could, under specific conditions, execute arbitrary code on the host. The advisory does not publish the triggering conditions, and defenders do not need to reproduce them to establish that an internet-reachable, unpatched installation warrants urgent action.

WHMCS says both issues were responsibly disclosed through its security program. Its advisories do not claim exploitation in the wild or report that any organization was compromised. That distinction matters: these are preventive vulnerability notices, not evidence that every affected system has been abused.

## One release closes two different paths

The supported version floors are straightforward but must be read precisely. All WHMCS 9.x builds before 9.0.8 and all 8.x builds before 8.13.7 are affected, according to the vendor. The 8.13 and 9.0 change logs record fixes for both CVEs in those releases.

Older installations need more than a narrow hotfix assumption. For CVE-2026-67398, WHMCS says versions from 4.5 onward are affected and that fixes are available only for supported releases; operators on older branches must move to 8.13.7 or 9.0.8. CVE-2026-67399 is described as affecting 8.0.x and later, so disabling the payment module associated with the first flaw does not address the second.

The vendor does provide a temporary workaround for CVE-2026-67398: deactivate the 2CheckOut module and select an alternative payment gateway. It publishes no temporary workaround for CVE-2026-67399. Treat module deactivation as limited risk reduction for one data-access path, not as a substitute for the security release.

## Turn the update into evidence

Start with an inventory of every self-hosted WHMCS instance, including staging systems, migration copies, disaster-recovery environments and old portals retained under alternate hostnames. Record the active application version, public reachability, branch support status and whether 2CheckOut is enabled. A package downloaded to an administrator's workstation is not proof that the production application changed.

Apply the appropriate supported update through the organization's normal emergency-change process. Then verify the version from the running installation and confirm that expected customer, billing and administrative workflows still function. Where proxies, containers or multiple web nodes are involved, check each serving node; a mixed pool can leave some requests reaching the old code even when one interface reports the new release.

Exposure reduction should continue during rollout. Restrict administrative access, remove obsolete test copies from public routing, and avoid restoring an older application snapshot without immediately reapplying the security update. If a legacy deployment cannot be upgraded promptly, taking it off the public path is safer than relying on obscurity or a module-only workaround.

## Review the boundaries around billing automation

These disclosures illustrate why billing applications deserve control-plane treatment. They join customer identity data, payment integrations, automation and server-side execution in one web-facing system. Version ownership should therefore be explicit: one team must know which branch is supported, when updates are released, and how production state is independently verified.

After remediation, review whether retired gateways remain enabled, whether archived installations still resolve publicly, and whether monitoring can distinguish application-version drift across nodes. Keep the conclusion bounded by the evidence: the advisories establish serious vulnerable paths and fixed releases, not exploitation. The defensible outcome is a current, supported estate with fewer exposed copies and verifiable ownership of the next update.
