---
title: "CAPEv2 Task APIs Need Ownership Proof"
subtitle: "A newly published authorization flaw shows why malware-analysis records need per-user checks, not authentication alone."
description: "CVE-2026-90768 exposes a cross-user authorization gap in CAPEv2 task APIs, making access scope and task ownership immediate review priorities."
date: 2026-09-13 23:09:50 +0400
layout: post
category: defense
tags: [capev2, malware-analysis, access-control, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-13-capev2-task-apis-need-ownership-proof.svg
image_alt: "Abstract blue malware-analysis capsules separated by a glowing ownership gate that blocks one amber task from crossing into another analyst's workspace"
key_points:
  - "CVE-2026-90768 affects CAPEv2 through commit 471ee4b and requires an authenticated account."
  - "The gap can expose or delete another user's analysis when affected task capabilities are enabled."
  - "Teams should restrict shared access, disable unnecessary task functions and demand commit-level remediation proof."
sources:
  - title: "CAPEv2 through commit 471ee4b REST API Task Endpoints Missing Ownership Check"
    publisher: "CVE Program · September 13, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/90xxx/CVE-2026-90768.json"
  - title: "CAPEv2 REST API missing task ownership check - cross-user IDOR in tasks/view, tasks/list, tasks/delete"
    publisher: "CAPEv2 on GitHub · August 16, 2026"
    url: "https://github.com/kevoreilly/CAPEv2/issues/3162"
  - title: "REST API — CAPE Sandbox v2.5 Book"
    publisher: "CAPE Sandbox documentation · accessed September 13, 2026"
    url: "https://capev2.readthedocs.io/en/latest/usage/api.html"
---

A newly published CAPEv2 vulnerability shows that logging in is not the same as being authorized. CVE-2026-90768 concerns task APIs that can let one authenticated user reach another user's malware-analysis records. For shared sandboxes, the immediate defensive question is whether every action is bound to the task owner.

This is a vulnerability disclosure, not a report of exploitation or an organizational breach. The sources identify no affected victim and make no claim of activity in the wild.

## What the disclosure establishes

The CVE record was published on September 13 and rates the issue High: 8.6 under CVSS 4.0 and 8.1 under CVSS 3.1. It defines CAPEv2 through commit `471ee4b` as affected. An attacker needs a low-privilege authenticated account, but the vulnerable actions are reachable over the network without user interaction.

The underlying report says the affected REST API task operations do not consistently verify that the requesting user owns the requested analysis. Depending on enabled capabilities, one user may list tasks across the system, view another user's task metadata or delete an analysis belonging to someone else. The deletion path can remove the database record, report data and analysis directory.

That is both a confidentiality and integrity problem. Sandbox task data can contain submission targets, status information and other investigation context. Deletion can also break an analyst's evidence trail even when it does not disrupt the sandbox service itself. The published CVSS assessments accordingly assign high confidentiality and integrity impact, but no availability impact to the vulnerable system.

## Shared access is the decisive condition

CAPEv2 is a malware sandbox that executes suspect files in an isolated environment and collects behavioral and forensic artifacts. That purpose can create a misleading mental model: teams may focus on containing the sample while overlooking authorization around the resulting case data.

The flaw matters most where multiple ordinary users or automation identities share one deployment. The report's prerequisites include web and token authentication plus enabled task-listing, task-viewing or task-deletion functions. A single-user lab with no remote API exposure has a different risk profile from a central service used by several teams, customers or pipelines.

Authentication is therefore only the first inventory question. Defenders should identify who can obtain a token, which task capabilities are enabled, where the API is reachable from and whether service accounts share permissions intended for human analysts. They should also distinguish administrators, who may legitimately need system-wide visibility, from normal users whose access should stop at their own task objects.

## Contain the authorization gap

The public issue remains open and shows no linked pull request or development item. The CVE record names an affected commit boundary but does not identify a fixed release. Teams should not assume that a later checkout is safe merely because its commit hash differs. Remediation needs explicit upstream confirmation or a reviewed change that enforces ownership on every relevant read, list and delete path.

Until that proof exists, reduce the exposed surface. Restrict the web interface and API to trusted analyst networks, remove accounts and tokens that no longer need access, and disable task-list, task-view or task-delete capabilities that workflows do not require. Where mutually untrusted groups use the same service, separate instances are a stronger temporary boundary than relying on the affected application layer.

Review application, proxy and authentication logs for task access that does not match the requesting identity. Preserve database and analysis-storage backups before changing permissions or configuration, and test recovery of a representative task. If logs suggest cross-user access, follow the organization's incident process; the advisory itself is not evidence that such access occurred.

## Prove the boundary after remediation

A successful fix should be measured as an authorization property, not merely a deployment event. Test with two non-administrator accounts and confirm that each can list, view and remove only its own permitted work. Confirm separately that approved administrative workflows still function and are logged.

Finally, record the exact deployed commit, configuration state and network exposure. CAPEv2 has multiple task surfaces, including its web interface and REST API, so checking one route is insufficient. The durable lesson is simple: a sandbox contains untrusted code, while object-level authorization contains the people and services allowed to see its results.
