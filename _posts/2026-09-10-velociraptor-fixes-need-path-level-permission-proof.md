---
title: "Velociraptor Fixes Need Path-Level Permission Proof"
subtitle: "Two newly published CVEs show why authorization must hold across monitoring and recovery workflows."
description: "Two Velociraptor CVEs expose permission gaps in client monitoring and notebook restore paths; version 0.77.2 sets the fixed floor."
date: 2026-09-10 08:22:33 +0400
layout: post
category: defense
tags: [velociraptor, authorization, endpoint-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-10-velociraptor-fixes-need-path-level-permission-proof.svg
image_alt: "Abstract endpoint telemetry and notebook fragments passing through separate amber paths into a shared teal permission gate"
key_points:
  - "CVE-2026-19583 allowed a monitoring workflow to miss permissions required by sensitive artifacts."
  - "CVE-2026-19584 could evaluate planted notebook content with elevated permissions during backup restoration."
  - "Both vendor advisories identify versions before 0.77.2 as affected, making the running build the first proof."
sources:
  - title: "CVE-2026-19583.json"
    publisher: "CVE Program · September 10, 2026"
    url: "https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/19xxx/CVE-2026-19583.json"
  - title: "CVE-2026-19584.json"
    publisher: "CVE Program · September 10, 2026"
    url: "https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/19xxx/CVE-2026-19584.json"
  - title: "CVE-2026-19583: Velociraptor Required Permissions bypass by using client monitoring queries"
    publisher: "Velociraptor · August 15, 2026"
    url: "https://docs.velociraptor.app/announcements/advisories/cve-2026-19583/"
  - title: "CVE-2026-19584: Velociraptor VQL injection during notebook restore from backup"
    publisher: "Velociraptor · July 31, 2026"
    url: "https://docs.velociraptor.app/announcements/advisories/cve-2026-19584/"
---

Two Velociraptor vulnerability records published early September 10 expose the same architectural weakness through different workflows: a permission check that protects a direct action may disappear when that action is reached through monitoring or recovery machinery.

The issues affect a defensive platform trusted to collect and analyze endpoint evidence. That makes the practical response more precise than simply “patch a server.” Teams should update first, then prove that permissions remain attached to sensitive behavior across every route that can schedule or reconstruct it.

## What the new records establish

The official [CVE-2026-19583 record](https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/19xxx/CVE-2026-19583.json) was published at 02:58 UTC on September 10. It describes a missing required-permission check in Velociraptor client monitoring. Some sensitive artifacts require additional permissions; the record uses an artifact capable of endpoint command execution as its example. The client-monitoring route did not enforce those required permissions or require the artifact to carry the expected client-events type.

The vendor's [advisory for CVE-2026-19583](https://docs.velociraptor.app/announcements/advisories/cve-2026-19583/) says exposure requires at least the investigator role and the ability to add a client-monitoring artifact through the graphical interface. It identifies Velociraptor on Linux versions before 0.77.2 as affected. The CVE record assigns a 9.9 critical CVSS 3.1 score, but the stated role prerequisite still matters when prioritizing a specific deployment.

The [CVE-2026-19584 record](https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/19xxx/CVE-2026-19584.json), published at 03:00 UTC, covers a different path. Velociraptor's default-enabled daily backup can contain notebook cells. According to the [vendor advisory](https://docs.velociraptor.app/announcements/advisories/cve-2026-19584/), a user with notebook-editing permission could place a query in a cell that would be evaluated with elevated permissions if that backup were later restored. This issue also affects versions before 0.77.2.

Neither cited advisory reports exploitation or describes an affected organization. These are vulnerability disclosures, not evidence that a deployment was compromised.

## Alternate workflows must preserve authority

The monitoring flaw is a classic authorization-path problem. A sensitive artifact may be correctly guarded when scheduled directly while remaining reachable through a recurring client-monitoring configuration. The control is only effective if the platform evaluates the artifact's own required permissions at the final scheduling boundary, regardless of which interface or workflow produced the request.

The restore flaw makes the same point across time. A notebook backup is not inert merely because it is stored as recovery material. Once restoration reconstructs executable query content, that content crosses back into an active trust domain. Permissions and input handling must therefore be enforced when the restored state becomes operational, not assumed from whoever created or transported the archive.

Defenders should map privileges to capabilities rather than job titles. Identify every account able to change client monitoring and every account able to edit notebooks. Then identify who can initiate restoration and where backup archives originate. This produces a testable authorization graph without assuming that all investigator accounts need identical power.

## Establish the fixed floor and reduce exposure

Upgrade Velociraptor deployments to 0.77.2 or later through the supported release process, and verify the version reported by the running server after the change. Check standby systems, test instances and deployment images as well as the primary service. An old image or recovery node can reintroduce an affected build after the main instance is corrected.

Until an upgrade is complete, remove unnecessary access to client-monitoring configuration and notebook editing. The vendor's CVE-2026-19584 workaround is narrower: inspect a backup archive before restoration for malicious notebook content and do not automatically restore backups from untrusted sources. That reduces the restore-path risk but does not address the monitoring flaw.

Treat backup provenance as a security property. Store archives in access-controlled locations, record who created and approved them, and require an explicit review before restoration. These controls remain valuable after patching because recovery workflows can revive old configuration and executable state.

## Verify denial, not just successful operation

Functional testing should show that authorized monitoring still works, but the decisive security test is negative. In a non-production environment, use representative low-privilege roles to confirm that an artifact requiring an extra permission cannot be scheduled through client monitoring. Separately, verify that notebook restoration does not grant restored content authority beyond the initiating user's approved scope.

Review role assignments and configuration-change records for unexpected monitoring or notebook changes, while avoiding conclusions that the public evidence cannot support. The disclosures establish vulnerable paths; they do not establish misuse.

Closure should require three proofs: every instance runs at least 0.77.2, sensitive artifact permissions are enforced through indirect scheduling paths, and restored notebook content cannot acquire unintended authority. That turns two fixes into a durable rule for defensive tooling: privileges must follow the action, not the route used to reach it.
