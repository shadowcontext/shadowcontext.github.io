---
title: "MemOS Authentication Needs Fail-Closed Proof"
subtitle: "A newly published critical flaw shows why AI memory services must reject ambiguous internal identity signals."
description: "CVE-2026-75110 puts MemOS authentication under scrutiny and gives defenders a practical test for fail-closed AI service boundaries."
date: 2026-08-18 11:10:05 +0400
layout: post
category: ai-security
tags: [ai-agents, authentication, api-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-18-memos-authentication-needs-fail-closed-proof.svg
image_alt: "Abstract layered memory forms behind a luminous access gate with a sealed missing-key gap"
key_points:
  - "CVE-2026-75110 covers MemOS versions through 2.0.30 and describes a critical authentication bypass."
  - "Exposure requires authentication to be enabled while an internal-service secret remains unset."
  - "Defenders should contain reachable deployments and require explicit proof that every identity path fails closed."
sources:
  - title: "MemOS Authentication Bypass via Unset INTERNAL_SERVICE_SECRET"
    publisher: "VulnCheck via CVE Program · 17 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/75xxx/CVE-2026-75110.json"
  - title: "Authentication bypass in MemOS server: internal-service check fails open when INTERNAL_SERVICE_SECRET is unset"
    publisher: "MemTensor MemOS issue tracker · 16 August 2026"
    url: "https://github.com/MemTensor/MemOS/issues/2259"
  - title: "API Key Authentication Middleware for MemOS"
    publisher: "MemTensor MemOS source · accessed 18 August 2026"
    url: "https://raw.githubusercontent.com/MemTensor/MemOS/main/src/memos/api/middleware/auth.py"
---

A newly published vulnerability in MemOS turns a missing configuration value into a trusted identity. For defenders running memory infrastructure for AI agents, the important lesson is broader than one comparison: authentication must reject incomplete evidence, especially on service-to-service paths that receive elevated authority.

## What the record establishes

CVE-2026-75110 was published on 17 August by VulnCheck through the CVE Program. The record describes an authentication bypass in MemOS, a memory platform for large language models and AI agents, and assigns it critical severity: 9.8 under CVSS 3.1 and 9.3 under CVSS 4.0. It lists versions through 2.0.30 as affected.

The vulnerable condition is specific. Authentication must be enabled, while the environment value used as the internal-service secret is unset. According to the CVE and the public project issue, the middleware compares the incoming internal-service header with that environment value. When both are absent, the comparison succeeds. The request is consequently classified as internal and receives broad scopes without presenting an API key.

The issue says this path can reach administrative key-management and data functions. ShadowContext is not reproducing the request sequence or proof-of-concept details. The defensive fact is sufficient: an omitted identity signal can be interpreted as a successful identity match.

The project issue is open and labelled in progress. At publication time, it shows no linked pull request or release. The current default-branch middleware also still contains the affected comparison. That does not prove every deployment is exposed, but it means defenders should not assume that pulling the latest source or reinstalling the current package constitutes remediation.

## Why AI memory raises the stakes

Agent memory is not passive storage. MemOS describes a unified layer for storing, retrieving, editing and deleting long-term memory, including text, images, tool traces and personas. Its documentation also describes sharing and isolation across users, projects and agents. A privileged authentication failure at that layer can therefore cross several control objectives at once: confidentiality of retained context, integrity of memories that shape future agent behavior, and availability of keys or stored data.

That makes the internal-service exception a security boundary, not a convenience flag. Network location, a special header or a shared secret may contribute to service identity, but absence must never equal proof. An internal caller should be accepted only after explicit, non-empty evidence is validated, with narrowly assigned permissions and a clear audit trail.

This is also a warning about configuration semantics. “Authentication enabled” sounds like a safe state, yet the reported combination enables the primary control while leaving a secondary trust path incomplete. Security reviews need to evaluate the full decision tree, including bypasses intended for sidecars, workers, health services and administrative automation.

## Immediate defensive actions

Start with inventory. Locate self-hosted MemOS services, containers and derived images, then record the deployed package version or source revision. Confirm whether the extended authenticated API service is running, whether authentication is enabled, and whether any management interface is reachable beyond its strictly required callers.

Until the project publishes and documents a complete fix, remove public or broadly shared network exposure. Restrict access at a trusted reverse proxy, firewall or service-mesh policy to known application identities. Do not treat setting the missing secret as a permanent repair: it may reduce the reported condition, but it does not demonstrate that other routes, trust signals or deployment templates enforce authentication consistently.

Protect the surrounding assets as well. Review API-key issuance and revocation records, preserve relevant authentication logs, and rotate administrative credentials if configuration history cannot establish that the vulnerable combination was never reachable. These are precautionary validation steps, not evidence that exploitation occurred; the CVE record does not report observed exploitation.

## Proof must cover every route

The acceptance test for remediation should be behavioral. With each optional identity value absent, empty, malformed or incorrect, protected routes must return an authentication failure and must not acquire an internal principal. Repeat the test for administrative and data APIs, through the same proxy and container topology used in production.

Then test the valid internal path: require an explicit secret or stronger workload identity, compare it safely, grant only the scopes the calling service needs, and log the decision without recording secrets. Pin the corrected artifact by version and digest, rather than relying on a moving branch.

Finally, add the negative cases to deployment gates. A release should fail if authentication is enabled but required trust material is missing, and startup should fail closed rather than silently creating a weaker mode. For AI memory systems, configuration completeness is part of authorization—and defenders need runtime proof of both.
