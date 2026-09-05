---
title: "Postgres MCP Fix Makes Database Permissions the Read-Only Boundary"
subtitle: "A newly disclosed validation flaw shows why an agent's database limits must survive imperfect application filtering."
description: "AWS fixed CVE-2026-85787 in its Postgres MCP server, reinforcing database roles—not SQL blocklists—as the durable read-only control."
date: 2026-09-05 13:10:25 +0400
layout: post
category: ai-security
tags: [mcp, postgresql, database-security, least-privilege]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-05-postgres-mcp-fix-needs-database-enforced-read-only.svg
image_alt: "Abstract AI request ribbons meeting a luminous permission shield before a protected layered database"
key_points:
  - "Upgrade awslabs.postgres-mcp-server from versions earlier than 1.1.7."
  - "Use a dedicated database role whose privileges independently enforce the intended scope."
  - "Test agent read-only claims at the database boundary, not only in application validation."
sources:
  - title: "CVE-2026-85787 - An incomplete list of disallowed inputs in the SQL validation component in Amazon awslabs postgres-mcp-server to modify data beyond the read-only scope"
    publisher: "Amazon Web Services · September 4, 2026"
    url: "https://aws.amazon.com/security/security-bulletins/2026-101-aws/"
  - title: "awslabs.postgres-mcp-server"
    publisher: "Python Package Index · August 26, 2026"
    url: "https://pypi.org/project/awslabs.postgres-mcp-server/"
---

AWS has disclosed a validation flaw in its open-source Postgres Model Context Protocol server that could let database changes cross an intended read-only boundary. The patch matters, but the lasting lesson is architectural: an application's SQL filter should never carry more authority than the database identity behind it.

## What the advisory establishes

AWS published CVE-2026-85787 on September 4 and classifies the bulletin as important. The issue affects every PyPI release of `awslabs.postgres-mcp-server` before 1.1.7. AWS says an incomplete list of disallowed inputs in the SQL validation component could allow an unauthenticated actor to modify data beyond the server's read-only scope by placing crafted SQL in content submitted when an authenticated user interacts with the MCP server.

That wording defines a specific chain of conditions. An affected server must process attacker-influenced content during an authenticated interaction, and the database connection must possess authority that makes the unintended operation possible. The advisory does not say that the hosted Amazon RDS or PostgreSQL services themselves are vulnerable, nor does it report exploitation. Defenders should treat this as a software and deployment-control issue, not infer an incident.

AWS says version 1.1.7 addresses the flaw and recommends upgrading to the latest release, including incorporating the correction into forks and derivative code. PyPI's release history shows newer package versions are available, so teams should resolve to a current supported build rather than pinning to the minimum fixed version by habit.

## Why a blocklist is not a permission model

The flaw illustrates a recurring problem in agent-connected tools: a read-only label may describe application intent without proving effective database authority. A SQL blocklist tries to recognize and reject disallowed statements before execution. Its protection depends on every relevant input form, parser behavior and database capability being represented correctly.

Database permissions work at a different layer. If the MCP server connects through a role that lacks mutation privileges, a query that passes imperfect application validation still meets a separate authorization decision at the database. The two controls can reinforce each other, but they are not interchangeable.

This separation becomes more important when an AI assistant can incorporate retrieved documents, user messages or other external context into a tool request. The authenticated person operating the assistant and the content influencing a request do not necessarily share the same trust level. Authentication proves who opened the session; it does not make every instruction reaching the tool trustworthy.

## What defenders should change

First, inventory the actual package version in developer machines, agent hosts, containers and internal tool images. Upgrade any version earlier than 1.1.7 to the latest compatible release, rebuild affected artifacts and verify the loaded runtime rather than relying only on a lockfile. Review internal forks for the upstream correction.

Then inspect the database identity used by each Postgres MCP deployment. AWS recommends a dedicated, minimally privileged role. It specifically advises against connecting as a superuser, `rds_superuser` or cluster master user. For read-only use, grant only the required connection, schema-usage and select permissions, and enforce read-only transactions at the role level. Scope access to the necessary schemas and tables; do not let convenience credentials silently expand the agent's reach.

Where an immediate upgrade is impossible, AWS presents the minimal database role as the strongest compensating control. That is also sound long-term design. Application validation can provide early rejection and clearer errors, while the database remains authoritative about what the session may do.

## Prove the boundary after patching

Closure needs more than a package report. From the same identity and network path used in production, verify that approved read operations still work and that representative write, schema-change and privileged administrative operations are denied by the database. Keep tests non-destructive and run them against an isolated validation environment.

Also review logs at both layers. The MCP service should record tool decisions without exposing sensitive query contents, while database auditing should make the effective role and rejected actions visible. Alerting should distinguish a validation rejection from a database authorization denial: the latter may reveal a gap in the application control even when the final boundary holds.

Finally, document the invariant operators can check: the agent process uses a named, dedicated role; that role has only the intended grants; and its restrictions are tested after every credential, schema or deployment change. CVE-2026-85787 is a focused input-validation flaw. Its broader lesson is that “read-only” should be a property the database can prove, not a promise made by the layer in front of it.
