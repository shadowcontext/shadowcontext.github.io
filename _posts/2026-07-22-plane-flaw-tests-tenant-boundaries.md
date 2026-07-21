---
title: "Plane Flaw Makes Tenant Boundaries an Operational Control"
subtitle: "A cross-workspace authorization bypass leaves defenders managing exposure and evidence while no patch is available."
description: "CERT/CC warns that Plane 1.3.0 and earlier can expose assets across workspaces, with no patch currently available."
date: 2026-07-22 02:08:00 +0400
layout: post
category: defense
tags: [Plane, authorization, multi-tenant security, vulnerability management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-22-plane-flaw-tests-tenant-boundaries.svg
image_alt: "Layered blue workspace chambers containing file-like facets, with one amber asset stopped at a bright tenant boundary"
key_points:
  - "CERT/CC says Plane 1.3.0 and earlier have a cross-workspace authorization bypass."
  - "An authenticated user could access, duplicate or delete assets belonging to another workspace."
  - "With no patch available, defenders should restrict endpoints and monitor tenant-boundary activity."
sources:
  - title: "Plane contains multi-tenant authorization bypass vulnerability"
    publisher: "CERT Coordination Center · 21 July 2026"
    url: "https://www.kb.cert.org/vuls/id/762226"
---

A newly disclosed vulnerability in Plane turns workspace isolation from an assumed product property into something defenders must actively enforce. CERT/CC says the project-management platform does not consistently verify that a user requesting an asset is authorised for the workspace named in the request.

The immediate challenge is not routine patch deployment. As of its 21 July advisory, CERT/CC says no patch is available and that it was unable to reach Plane to coordinate the issue.

## What CERT/CC confirmed

The vulnerability is tracked as CVE-2026-15342 and affects Plane versions 1.3.0 and earlier, according to CERT/CC. Plane is an open-source project-management platform whose workspaces separate issues, tasks and associated files for different groups.

The weakness sits in the asset-management API. CERT/CC says affected endpoints accept a workspace slug and asset identifier but fail to verify that the authenticated requester is authorised for the specified workspace. A user with access to any Plane workspace could therefore request an asset associated with another workspace if the necessary identifiers were known.

The possible actions are consequential: unauthorised users may be able to access, duplicate or delete another workspace's assets. This puts confidentiality, integrity and availability at risk within the application. Exploitation is not described as unauthenticated; it requires an account in an existing workspace. The advisory also does not say the vulnerability is being exploited in the wild. Defenders should preserve those distinctions when briefing risk owners.

CERT/CC identifies Plane 1.3.0 and earlier as affected, but reports no vendor statement and no available patch. That means version inventory is essential, yet version discovery alone cannot complete remediation.

## Why authentication is not enough

This disclosure illustrates a common multi-tenant failure: proving who a user is does not prove that the user may act on every object the application can locate. Every asset operation must bind the authenticated identity, the requested workspace and the specific object to one authorisation decision on the server side.

The distinction matters operationally because ordinary access logs may make a malicious request look legitimate. The requester can have a valid account and valid session. A useful detection signal is the mismatch between that identity's permitted workspace context and the workspace or asset named in the request—not merely a failed login or a suspicious source address.

Asset identifiers also should not be treated as secrets or security controls. CERT/CC notes that relevant identifiers may appear in issue or board URLs, attachment links or exported API data. The defensive lesson is broader than this product: opaque identifiers can reduce accidental discovery, but they cannot replace object-level permission checks.

## What defenders should do now

First, identify every self-hosted or managed Plane deployment and record its version, exposure, owner and business purpose. Confirm whether multiple teams, clients or sensitivity levels rely on workspace separation. A single-team deployment has a different immediate risk profile from a shared service where workspace boundaries carry a strong confidentiality expectation, but both remain affected if they run a listed version.

CERT/CC recommends using API-gateway rules, firewall restrictions or other network controls to limit access to the vulnerable endpoints. Apply the narrowest control that business use permits. Consider restricting access to trusted networks or an authenticated access proxy, and disable unnecessary external reachability. These are compensating controls, not a repair to the missing authorisation check.

Enable and retain detailed activity logging. Monitor for requests in which a user's authorised workspace does not match the workspace in the asset path, as well as unusual presigned-URL activity and unexpected delete operations—the patterns specifically highlighted by CERT/CC. Where the platform cannot expose enough context, collect it at the reverse proxy or API gateway while avoiding unnecessary logging of sensitive file contents or credentials.

Review recent activity for those same patterns, within available retention. Suspicious evidence should enter the organisation's established investigation process; the advisory itself is not proof that a deployment has been misused.

## Set a defensible closure condition

An unpatched vulnerability needs an explicit owner, review date and exit condition. Track CERT/CC's note and Plane's official channels for a vendor response or fixed release, then validate the correction in a representative environment before restoring any access removed as a temporary control.

Closure should require evidence that every affected deployment has received a verified fix—or has been retired—not simply that perimeter filtering exists. Teams should also test whether asset read, copy and delete operations reject cross-workspace requests, including calls made by low-privilege accounts.

The lasting lesson is architectural: tenant separation is not a label applied to data. It is a policy that must be checked on every object operation, made visible in telemetry and tested as a security boundary. Until Plane provides a durable correction, defenders should treat that boundary as an operational control they must supply themselves.
