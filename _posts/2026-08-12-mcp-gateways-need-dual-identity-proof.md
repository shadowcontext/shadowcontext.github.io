---
title: "MCP Gateways Need Proof of Both User and Agent Identity"
subtitle: "New production research shows why centralized authentication must preserve who requested an action and which agent executed it."
description: "New MCP gateway research makes user, agent, and service-account identity separate controls for authorization, audit, and offboarding."
date: 2026-08-12 16:09:43 +0400
layout: post
category: ai-security
tags: [mcp-security, identity, oauth, ai-agents]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-12-mcp-gateways-need-dual-identity-proof.svg
image_alt: "Abstract human and machine identity paths converging through a shielded gateway before reaching protected tool nodes"
key_points:
  - "Treat human users and unattended agents as distinct security personas."
  - "Authorize service-account use before attaching its credential to a request."
  - "Keep tool-level and resource-level authorization as separate enforcement layers."
sources:
  - title: "A Gateway Architecture for Enterprise MCP Authentication: Unifying Heterogeneous Auth, Identity Delegation, and the User / Non-User Persona Problem"
    publisher: "arXiv · August 11, 2026"
    url: "https://arxiv.org/abs/2608.10760"
  - title: "Authorization"
    publisher: "Model Context Protocol · June 18, 2025 specification"
    url: "https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization"
  - title: "RFC 8693: OAuth 2.0 Token Exchange"
    publisher: "RFC Editor · January 2020"
    url: "https://www.rfc-editor.org/info/rfc8693/"
---

A newly listed research paper on enterprise Model Context Protocol deployments turns an abstract identity problem into a practical control decision. When AI agents can call many internal tools, authenticating the connection is not enough. Defenders must retain evidence of the human, the agent, and any service account involved in each action.

The paper describes a centralized gateway operating in production before dozens of MCP servers. Its most useful lesson is not that every organization needs the same gateway. It is that user and machine identities must remain separate even when they share one tool endpoint.

## One endpoint can hide different authorities

The authors divide callers along two axes: the persona making the request and the credential used downstream. An interactive employee may need a user-scoped OAuth token, while an unattended workflow should run as a non-user service identity. Combining those cases without an explicit boundary can let automation acquire authority intended for a person.

The reported deployment centralizes authentication, token handling, observability, and offboarding at a gateway. Downstream MCP servers verify gateway-issued tokens rather than independently building full identity stacks. The paper says this arrangement fronts dozens of servers used by web, desktop, custom software-development-kit, and low-code clients.

That is an experience report, not proof that centralization removes risk. A gateway also concentrates policy and implementation mistakes. Its value depends on whether every request is validated, every server uses the verifier correctly, and bypass paths are eliminated. Teams should inventory direct server access before claiming the gateway is an enforcement point.

## Delegation must preserve two identities

The subtle case is an agent acting for a user. A log containing only the employee loses which agent performed the work; a log containing only the agent loses whose authority it exercised. The researchers use OAuth token exchange, standardized in RFC 8693, to carry a subject identity for the user and an actor identity for the agent.

This distinction should survive the complete chain: client, gateway, downstream server, resource, and audit record. It also supports a firm rule: an agent may inherit a user's permitted scope but must not exceed it. Autonomous agents, by contrast, should be evaluated only against their machine identity and denied user-scoped paths.

Defenders should test audience, issuer, signature, expiry, and scope at every token-verification point. The MCP authorization specification requires protected servers to validate that tokens were issued for the intended audience and calls for resource indicators identifying the target server. A private tunnel can reduce public exposure, but it cannot replace per-request authorization.

## Service accounts require a pre-credential gate

Risk rises when a person invokes a tool that executes through a more privileged service account. The paper's proposed control is an entitlement check after resolving the real user but before attaching the service-account credential. Without that ordering, mere access to the tool could become access to everything the service account can reach.

Make that sequence observable and testable. Record the requesting user, calling agent or client, selected tool, service account, authorization decision, token audience, and downstream result. Alert when a non-user attempts a user-only flow, when a tool is reached outside the gateway, or when one identity suddenly invokes unfamiliar service accounts.

Credential storage matters too. The reported architecture keeps downstream secrets at the gateway rather than passing them through clients. Operators should pair that pattern with a managed secrets store, narrow scopes, short lifetimes where supported, rotation, and strict administrative separation around gateway configuration.

## Convert the model into assurance checks

Start by classifying every MCP caller as interactive user, delegated agent, autonomous agent, or user invoking a service account. For each route, document which identity authenticates, which credential reaches the downstream system, and where authorization occurs. Missing cells in that matrix are deployment gaps, not paperwork gaps.

Keep two enforcement layers. The gateway should decide whether an identity may reach a tool; the system of record should decide which mailbox, dataset, ticket, or other resource that identity may access. Do not copy fine-grained data policy into a gateway that lacks the downstream context to enforce it correctly.

Finally, rehearse revocation. Disable a test user, agent, and service account in turn, then confirm that access fails across every server and that the denial is visible centrally. The defensive goal is stronger than single sign-on: every MCP action should retain verifiable proof of who asked, what acted, and why the resulting authority was allowed.
