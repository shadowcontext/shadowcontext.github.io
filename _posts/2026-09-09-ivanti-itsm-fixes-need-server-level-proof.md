---
title: "Ivanti ITSM Fixes Need Server-Level Proof"
subtitle: "Critical code-execution flaws make release-line inventory and runtime verification the real completion criteria."
description: "Ivanti Neurons for ITSM fixes require exact release-line mapping, controlled updates and proof that every server reached a corrected build."
date: 2026-09-09 03:14:08 +0400
layout: post
category: defense
tags: [ivanti, itsm, vulnerability-management, patch-verification]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-09-ivanti-itsm-fixes-need-server-level-proof.svg
image_alt: "Abstract service-management layers converging through a luminous verification shield onto a protected server core"
key_points:
  - "CVE-2026-12744 allows unauthenticated remote code execution in Neurons for ITSM before 2026.2."
  - "On-premises fixes differ by release line, while cloud tenants need confirmation of the mo2026.2 state."
  - "Ivanti says it has no evidence that the newly disclosed vulnerabilities are being exploited in the wild."
sources:
  - title: "September 2026 Security Update"
    publisher: "Ivanti · September 8, 2026"
    url: "https://www.ivanti.com/blog/september-2026-security-update"
  - title: "Ivanti security advisory (AV26-897)"
    publisher: "Canadian Centre for Cyber Security · September 8, 2026"
    url: "https://www.cyber.gc.ca/en/alerts-advisories/ivanti-security-advisory-av26-897"
  - title: "CVE-2026-12744"
    publisher: "CVE Program · September 8, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-12744"
  - title: "CVE-2026-12645"
    publisher: "CVE Program · September 8, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-12645"
---

Ivanti's September security release puts Neurons for ITSM into the urgent patch queue. Newly published CVE records describe remote code-execution paths in versions before 2026.2, including one that requires no authentication. For defenders, the central task is not merely scheduling an update; it is proving that every server and tenant reached the correct fixed state.

## What the new records establish

CVE-2026-12744 describes unsafe deserialization in Ivanti Neurons for ITSM before 2026.2. According to the CVE record, a remote, unauthenticated attacker could execute arbitrary code on the server. Ivanti, acting as the assigning authority, scores the vulnerability 9.8 under CVSS 3.1.

A second record, CVE-2026-12645, describes a missing-authorization flaw in the same product and version range. That route requires an authenticated, low-privilege user, but the record says successful exploitation could still lead to server-side code execution. Its CVSS 3.1 score is 9.9 because the assessed scope changes beyond the vulnerable component.

Those conditions matter for prioritisation. The unauthenticated path makes network reachability the first exposure question. The authenticated path means restricting public access does not close the issue where ordinary or externally managed accounts can reach the application. Neither record establishes that a particular deployment is exploitable without confirming its version and configuration.

Ivanti's September update says the company is disclosing vulnerabilities across Neurons for ITSM, Endpoint Manager Mobile and Sentry. It also says it has no evidence these newly disclosed vulnerabilities have been exploited in the wild and that other Ivanti solutions are not affected. That is useful scope, not a reason to defer a critical server-side fix.

## The fix is release-line specific

The Canadian Centre for Cyber Security's September 8 advisory supplies a compact version map. It lists Neurons for ITSM Cloud/SaaS releases before mo2026.2 as affected. For on-premises deployments, it identifies the September 2026 security patch for the 2025.2, 2025.3, 2025.4 and 2026.1 branches, with 2026.2 as the corrected destination for that line.

That matrix rules out a generic instruction such as “install the latest patch.” An estate may contain production and disaster-recovery nodes on different branches, test systems paused between upgrades, or integrations certified only for a particular release. Each instance needs its own starting version, target build and accountable owner.

Cloud customers still need evidence. A vendor-operated service changes who performs the deployment, not whether a customer should record completion. Confirm the tenant's service state against mo2026.2 through the supported administrative or support channel, and retain that confirmation with the remediation ticket.

## Build the deployment around service dependencies

IT service-management platforms sit inside operational workflows: ticket intake, email processing, identity federation, automation, asset records and administrator actions. Before changing the platform, map the integrations that must be tested after the update and preserve a supported recovery path. This is resilience planning, not evidence of malicious activity.

Reduce unnecessary exposure while rollout proceeds. Limit administrative and application access to required networks and identities, review dormant accounts, and ensure low-privilege roles cannot reach functions they do not need. These controls reduce opportunity, but they do not replace Ivanti's corrected software because one documented path is unauthenticated.

Stage the appropriate release-line update, validate core workflows, then promote it under change control. Avoid treating a successful installer exit or orchestration job as final proof. Cluster members, standby nodes, restored images and appliances can retain an older runtime even when the management console reports a completed task.

## Close only after runtime verification

The closure record should enumerate every active and recoverable instance, its pre-change version, prescribed target and observed post-change version. Verify from the running service or vendor-supported status interface. Then test authentication, ticket creation, email ingestion, automation and critical integrations so a security update does not silently damage the workflows responders depend on.

For cloud tenants, attach provider confirmation. For on-premises systems, attach node-level results and document any exception with an owner, compensating controls and deadline. Recheck templates and recovery media as well; an unpatched image can reintroduce the vulnerable state during the next rebuild.

Ivanti's disclosure turns version accuracy into the decisive control. The defensible finish line is a reconciled inventory showing no reachable server below its corrected branch, plus evidence that the service still performs its operational role after the change.
