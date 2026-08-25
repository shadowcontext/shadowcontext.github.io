---
title: "Plesk Extension Fixes Need Tenant-Boundary Proof"
subtitle: "Updates for two migration tools close a path from an unprivileged hosting subscription to root authority."
description: "Plesk fixed CVE-2026-65647 in its Migrator and Site Import extensions, making extension-version checks urgent on shared hosting servers."
date: 2026-08-25 17:09:33 +0400
layout: post
category: defense
tags: [plesk, vulnerability-management, hosting-security, privilege-escalation]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-25-plesk-extension-fixes-need-tenant-boundary-proof.svg
image_alt: "Abstract hosting server with two migration streams passing through segmented gates before reaching a protected privileged core"
key_points:
  - "CVE-2026-65647 affects two Plesk migration and import extensions."
  - "Plesk says an unprivileged subscription user may gain root-level code execution."
  - "Operators should update both extensions and verify their installed versions on every server."
sources:
  - title: "Vulnerability CVE-2026-65647 in Plesk's Site Import and Migrator extensions"
    publisher: "Plesk · August 25, 2026"
    url: "https://support.plesk.com/hc/en-us/articles/42871001389207-Vulnerability-CVE-2026-65647-in-Plesk-s-Site-Import-and-Migrator-extensions"
  - title: "How to manage Plesk extensions (install, disable, remove, update)"
    publisher: "Plesk · August 25, 2025"
    url: "https://support.plesk.com/hc/en-us/articles/12377511962007-How-to-manage-Plesk-extensions-install-disable-remove-update"
---

Plesk has fixed CVE-2026-65647 in its Migrator and Site Import extensions. The vendor says a user with an unprivileged hosting subscription may be able to execute arbitrary code as root when either affected extension is installed. For shared hosting, that turns an extension update into a direct test of whether the tenant boundary still holds.

## Two extensions, one privileged boundary

Plesk’s August 25 advisory identifies Plesk Migrator 2.35.0 and earlier and Site Import 1.12.0 and earlier as affected. The corrected releases are Migrator 2.36.0 and Site Import 1.12.1. Plesk says the weakness does not depend on a particular server configuration: any server running an affected version is affected.

The advisory describes local privilege escalation, not an unauthenticated internet attack. The stated prerequisite matters for triage because an attacker would need access through an unprivileged Plesk hosting subscription. It does not make the issue routine. On a multi-tenant server, that role is intentionally available to customers while root authority is supposed to remain behind the platform boundary.

Plesk says successful exploitation could give administrative control of the server and access to all subscriptions hosted there. That is a statement of potential impact, not evidence that exploitation has occurred. The advisory does not report active exploitation, affected organizations, or a breach, and defenders should not infer any of those from the severity of the privilege change.

## Check extension versions, not only the panel

The vulnerable components are extensions, so a check of the main Plesk panel version alone cannot establish remediation. Operators need an inventory of servers where Migrator or Site Import is installed, followed by the installed version of each extension. Both tools should be checked independently because their fixed release numbers differ.

Plesk’s extension-management guidance says extensions update automatically once a day by default. It also provides an administrative interface where operators can check for recent updates and apply them manually. Automatic updating is useful distribution machinery, but its configured presence is not evidence that a particular server received and activated a corrected extension.

For each server, the completion record should therefore name the extension, the observed post-update version, the time checked, and the responsible owner. The secure baselines are Migrator 2.36.0 or later and Site Import 1.12.1 or later. If an extension is not required, administrators can evaluate disabling or removing it through normal change control; that reduces exposed functionality but should not be represented as proof that an installed vulnerable copy was upgraded.

## Treat migration as privileged input processing

Migration and site-import functions sit at an unusually sensitive junction. They accept content and configuration associated with one environment, transform it, and write into another environment under platform authority. The defensive lesson is broader than this CVE: tenant-supplied migration input must never inherit more operating-system authority than the workflow strictly needs.

Hosting teams should map who can start imports or migrations, which service identity performs the work, and which filesystem destinations that identity can reach. They should also confirm that audit records distinguish the requesting subscription from the privileged worker that completes the task. Those checks do not replace Plesk’s update; they make the trust boundary observable and give future extension advisories a faster route to an accountable owner.

Shared environments deserve first priority because one control plane serves multiple subscriptions. Single-customer servers still need the fix: Plesk explicitly says affected versions do not become safe through a particular configuration, and an unprivileged account remains a meaningful boundary even when there is only one customer.

## Close with evidence, not update intent

After updating, administrators should re-open the extension inventory and confirm the corrected versions across every managed server. A small, authorized import or migration test can then verify that expected administration workflows still function, while platform monitoring confirms the task runs under the intended identity and reaches only intended destinations.

Exceptions need explicit handling. Offline systems, paused tenants, and servers outside the usual automation scope can easily miss a daily extension update. Record them separately, assign an owner, and restrict access until they can be brought to the fixed baseline.

The practical outcome is simple: update both affected extensions wherever present, then retain version-level evidence. CVE-2026-65647 is a reminder that a hosting panel’s security state includes the privileged extensions attached to it—and that tenant isolation is only as strong as the most powerful workflow a tenant can invoke.
