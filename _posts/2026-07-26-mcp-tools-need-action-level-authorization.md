---
title: "SiYuan Flaw Shows Why MCP Tools Need Action-Level Authorization"
subtitle: "CVE-2026-66012 turns a publishing role into a lesson about enforcing permissions at every AI tool boundary."
description: "A critical SiYuan flaw shows why MCP-enabled systems must enforce authorization on each tool, not rely on upstream identity or broad roles."
date: 2026-07-26 06:11:29 +0400
layout: post
category: ai-security
tags: [mcp, authorization, vulnerability-management, access-control]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-07-26-mcp-tools-need-action-level-authorization.svg
image_alt: "Abstract luminous gateway containing bounded tool nodes, with a protective arc separating them from an anonymous outer connection"
key_points:
  - "SiYuan versions before 3.7.2 are affected by CVE-2026-66012."
  - "The vulnerable path requires the Publish server to allow anonymous access."
  - "Defenders should enforce authorization again at every MCP tool and action."
sources:
  - title: "CVE-2026-66012 – Unauthenticated RCE via Missing Authorization in MCP Endpoint – SiYuan before v3…"
    publisher: "IONIX · July 25, 2026"
    url: "https://www.ionix.io/threat-center/cve-2026-66012/"
  - title: "SiYuan v3.7.2"
    publisher: "SiYuan · July 14, 2026"
    url: "https://github.com/siyuan-note/siyuan/releases/tag/v3.7.2"
  - title: "NVD - CVE-2026-66012"
    publisher: "NIST National Vulnerability Database · July 25, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2026-66012"
---

A newly published vulnerability in SiYuan is a sharp warning for teams connecting Model Context Protocol tools to applications: a user’s ability to reach an AI-facing endpoint must not be mistaken for permission to use every action behind it.

CVE-2026-66012 affects SiYuan before version 3.7.2. The disclosed path depends on the product’s Publish server being enabled with anonymous access, so exposure is configuration-specific. But the design lesson is broader: identity established by a proxy or a general access check is only the beginning of authorization.

## What the disclosure confirms

According to IONIX’s July 25 analysis, the affected MCP endpoint applies a general authentication check but does not enforce the administrator and read-only restrictions expected for the tools it exposes. Under anonymous Publish mode, the reverse proxy supplies a reader identity to requests. That identity can reach actions whose consequences exceed what a reader should be allowed to do.

IONIX says the exposed tool set includes workspace file operations and that successful abuse could affect confidentiality, integrity and availability. The CVE is scored 10.0 under CVSS 3.1 by the reporting source. This article does not treat that score as proof of universal exposure: the anonymous Publish configuration is a necessary condition described in the advisory.

The fix boundary is clear. Both the disclosure and the National Vulnerability Database identify versions before 3.7.2 as affected. SiYuan’s release page confirms that version 3.7.2 was released on July 14 and includes security fixes, although its public changelog does not enumerate this vulnerability.

## Why the trust boundary failed

The core issue is a mismatch between the role accepted at the application edge and the authority available deeper in the tool layer. A reader token may be appropriate for rendering published content. It is not automatically appropriate for file-changing operations, configuration access or extensibility features.

MCP makes this class of mistake especially consequential because one endpoint can broker many tools with very different effects. A single “authenticated” decision at the front door flattens those differences. Read, write, delete and administrative actions then inherit more trust than the original role was meant to carry.

Defenders should model three separate decisions: who may connect, which tool that identity may invoke, and which action or resource the tool may touch. Each decision should be enforced where the relevant context is still available. Proxies can attach identity, but the application and tool dispatcher must independently constrain capability.

## Immediate defensive actions

Operators should first establish whether SiYuan exists in their environment, including self-hosted instances and small team deployments that may sit outside a central software inventory. Record the running version and whether the Publish service is enabled, anonymously reachable and exposed beyond its intended network.

Upgrade affected installations to version 3.7.2 or later. If an immediate update is not possible, IONIX recommends disabling the Publish server or requiring authentication for it, and restricting network access to the application’s kernel and publishing services. Those are interim exposure reductions, not substitutes for the corrected authorization logic.

After updating, validate the deployed version from the running service rather than relying only on a package request or change ticket. Review access records for unexpected use of MCP capabilities and inspect workspace changes through the organization’s normal integrity and audit processes. The disclosure notes that IONIX is tracking exploitation attempts, but it provides no public evidence in the cited article that any particular organization was compromised.

## The control to carry forward

For every MCP deployment, build an action matrix that maps identities and roles to individual tools and their allowed operations. Default to denial when a role has no explicit need, and test the matrix through every ingress path—including anonymous publishing, shared links, reverse proxies and service-to-service calls.

The durable lesson from CVE-2026-66012 is not merely to patch one knowledge-management product. It is to keep the authority of an AI tool no broader than the authority of the person or service invoking it, and to prove that boundary at the point where each action is executed.
