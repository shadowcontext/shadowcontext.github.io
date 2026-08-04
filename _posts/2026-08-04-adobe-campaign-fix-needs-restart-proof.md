---
title: "Adobe Campaign Update Requires Build and Restart Proof"
subtitle: "A priority-one fix for seven critical flaws is complete only when the new server build is running."
description: "Adobe Campaign Classic build 9399 fixes seven critical flaws; defenders should verify deployment scope, server restart, and the live build."
date: 2026-08-04 21:11:12 +0400
layout: post
category: defense
tags: [vulnerability-management, patching, application-security, enterprise-software]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-04-adobe-campaign-fix-needs-restart-proof.svg
image_alt: "Abstract server workflow passing through a luminous security checkpoint into a verified green state"
key_points:
  - "Campaign Classic v7 build 9398 and earlier is affected on Windows and Linux."
  - "Build 9399 addresses seven critical vulnerabilities and carries Adobe's priority-one rating."
  - "On-premise and hybrid operators must restart the server and verify the live build."
sources:
  - title: "Security update available for Adobe Campaign Classic | APSB26-120"
    publisher: "Adobe · August 3, 2026"
    url: "https://helpx.adobe.com/security/products/campaign/apsb26-120.html"
  - title: "Latest Release | Adobe Campaign"
    publisher: "Adobe Experience League · August 3, 2026"
    url: "https://experienceleague.adobe.com/en/docs/campaign-classic/using/release-notes/latest-release"
---

Adobe has issued a priority-one security update for Campaign Classic v7, fixing seven critical vulnerabilities in the on-premise product. The important operational detail is easy to miss: installing the package is not the finish line. The Campaign server must be restarted before the fix is active, and defenders need evidence that build 9399 is the version actually running.

## What Adobe fixed

Adobe's APSB26-120 bulletin identifies Campaign Classic v7 7.4.3 build 9398 and earlier as affected on Windows and Linux. The corrected release is 7.4.3 build 9399. The scope is limited to fully on-premise deployments and the on-premise components of hybrid deployments; Adobe says its hosted instances have already been remediated and require no customer action.

The bulletin covers seven CVEs across several security boundaries: server-side request forgery, template injection, two SQL injection issues, incorrect authorization, evaluated-code injection, and a secure-design weakness. Adobe assigns five of the flaws an arbitrary-code-execution impact. The other two can lead to privilege escalation or a security-feature bypass.

Five entries have vectors indicating that no prior privileges or user interaction are required. Three carry a CVSS 3.1 base score of 10.0, while the remaining entries are scored 9.9, 9.8, 9.6, and 7.5. Those numbers should inform prioritization, but they are not evidence that exploitation has occurred. Adobe explicitly says it is not aware of exploitation in the wild for the issues addressed by this update.

## The deployment boundary matters

This is not a uniform cloud-service update. Organizations need to establish which deployment model they operate before deciding that no action is necessary. A hosted subscription, a hybrid design, and a fully on-premise installation create different responsibilities. In a hybrid environment, the fact that Adobe-hosted infrastructure is remediated does not remove the need to update customer-managed components.

The inventory should therefore connect each Campaign environment to its owner, operating system, exposure, current build, and maintenance route. Internet-reachable or partner-facing instances deserve the first maintenance slots because several issues are remotely reachable according to Adobe's vectors. Security teams should also identify non-production, disaster-recovery, and standby nodes; an inactive node can return to service later with an obsolete build if it is missing from the change plan.

Where an immediate maintenance window is impossible, exposure reduction and tightly constrained network access can reduce opportunity, but Adobe does not present those measures as substitutes for the update. The vendor's stated remedy is build 9399.

## Prove the restart, not just the install

Adobe's release notes add the key deployment condition: the Campaign server process, `nlserver`, must be restarted to load the new build, after which the fix is active by default. That creates two distinct control points. Package-management evidence can show that new files were placed on disk; runtime evidence must show that the corrected process has started and is serving the intended environment.

A defensible change record should capture the pre-change build, successful installation, restart completion, post-restart build, service health, and a small set of normal business-flow checks. If the platform is clustered, repeat that evidence per node rather than accepting a single control-plane status. Confirm that traffic has not returned to an unpatched node during a rolling update.

Monitoring should watch for failed starts, repeated restarts, unexpected outbound connections, and authorization anomalies during the maintenance period. These checks are operational safeguards, not claims of known exploitation. They help distinguish a clean rollout from a deployment that installed correctly but did not become effective.

## A concise defender checklist

Start by separating Adobe-hosted environments from customer-managed Campaign components. For each customer-managed node, record the running build and prioritize anything at 9398 or earlier. Deploy build 9399 through the approved change path, restart `nlserver`, and validate both the running version and service health.

Finally, retain node-level proof and close the change only when every production, recovery, and standby instance is accounted for. With this advisory, the most useful security metric is not “package deployed.” It is “corrected build running everywhere it can receive work.”
