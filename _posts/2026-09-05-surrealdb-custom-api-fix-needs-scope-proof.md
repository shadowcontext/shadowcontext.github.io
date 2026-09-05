---
title: "SurrealDB Custom API Fix Needs Tenant-Scope Proof"
subtitle: "A routing flaw shows why authenticated identity must constrain every namespace and database selection."
description: "SurrealDB 3.2.0 fixes cross-tenant custom API access, making runtime version, feature exposure, and tenant-scope tests essential."
date: 2026-09-05 18:10:58 +0400
layout: post
category: defense
tags: [surrealdb, authorization, multi-tenancy, database-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-05-surrealdb-custom-api-fix-needs-scope-proof.svg
image_alt: "Abstract violet database layers separated into tenant zones with a luminous route stopped at a cyan authorization boundary"
key_points:
  - "SurrealDB versions before 3.2.0 are affected when custom APIs are used on shared instances."
  - "A valid low-privilege account could reach a custom API outside its authenticated database scope."
  - "Defenders should verify the live version and test tenant rejection at every API dispatch path."
sources:
  - title: "Custom API route lets authenticated callers override namespace/database scope via URL path"
    publisher: "SurrealDB · updated September 4, 2026"
    url: "https://github.com/surrealdb/surrealdb/security/advisories/GHSA-848m-r628-vrxw"
  - title: "SurrealDB: Custom API route lets authenticated callers override namespace/database scope via URL path"
    publisher: "GitHub Advisory Database · updated September 4, 2026"
    url: "https://github.com/advisories/GHSA-848m-r628-vrxw"
  - title: "DEFINE API"
    publisher: "SurrealDB documentation · accessed September 5, 2026"
    url: "https://surrealdb.com/docs/reference/query-language/statements/define/api"
---

SurrealDB has fixed a high-severity authorization flaw that could let an authenticated user cross a tenant boundary through a custom API route. The issue is a sharp reminder that successful login is only the start of authorization: every user-controlled namespace, database and endpoint selection must remain bound to the identity that logged in.

## What the advisory confirms

The SurrealDB advisory says versions before 3.2.0 allowed a user authenticated to one namespace and database to invoke a custom API belonging to another namespace and database on the same instance. A low-privilege `VIEWER` account was sufficient. The issue is tracked as CVE-2026-63735 and carries a CVSS 3.1 score of 8.1.

The affected route accepted namespace and database values from the request path and applied them to the session before locating and running the endpoint. It did not first verify that the authenticated principal was permitted to use that target scope. The internal `api::invoke()` path was affected by the same underlying trust problem when session scope was selected through supported request context.

This matters because custom API handlers execute with definer-style authority. According to the advisory, a reachable endpoint could return data or trigger the writes and side effects defined by its handler. The flaw was not an unauthenticated bypass, and the maintainers say it does not affect single-tenant deployments or callers that already have instance-wide root scope. The advisory does not claim exploitation in the wild.

## Why route selection became authorization

SurrealDB documents `DEFINE API` as a way to create endpoints with custom middleware and permissions under a path containing a namespace, database and endpoint name. That design makes routing metadata security-sensitive. A path segment is not merely a lookup hint when it can determine which tenant's code and data context will be used.

The vulnerable behavior illustrates a common multi-tenant failure mode: authentication state is valid, and the selected object exists, but the relationship between the two is never proved. Endpoint-level permissions cannot reliably repair that gap when the dispatcher has already entered the wrong tenant scope, especially where handlers deliberately run with elevated authority.

The patch changes the order of trust. SurrealDB now checks the requested namespace and database against the caller's immutable authenticated level before resolving or executing the custom endpoint. Requests outside that level receive a `403 Forbidden` response. The check is applied both at the HTTP entry point and at the shared dispatch step used by `api::invoke()`, reducing the risk that a second call path bypasses the boundary.

## What defenders should verify

First, inventory SurrealDB instances and confirm the version of the running server process. Version 3.2.0 and later contain the fix; a corrected package in an image registry or deployment manifest is not proof that every replica restarted onto it.

Next, determine which shared instances enable custom API routes and which identities can reach them. Prioritize upgrades where unrelated tenants occupy the same instance. If immediate patching is impossible, the maintainers recommend disabling the custom API HTTP route through capabilities when it is unnecessary. They also advise treating separate deployments, rather than namespace and database boundaries, as the isolation boundary until patched. A restrictive endpoint permission expression can reduce exposure, but the advisory explicitly says it does not restore the missing boundary.

Review logs for unexpected cross-scope API requests only as a supporting check. Absence of a recognizable request does not prove safety, and the advisory does not provide evidence of exploitation in the wild.

## Close with tenant-negative tests

The strongest completion evidence combines runtime version and behavior. Build a test matrix with principals at root, namespace, database and record scope. Confirm that each role can reach only its intended custom endpoints and that changing path, header or session-selected scope cannot widen access. Exercise both the public HTTP route and internal invocation path because both reached the same dispatcher.

Also test endpoints whose handlers read, write or perform side effects, including those configured for broad endpoint access. Expected denials should be explicit and logged, while legitimate same-tenant calls should continue to work after the update.

CVE-2026-63735 is not just a database patching task. It is a useful design rule for every shared control plane: resolve tenant context from authenticated authority, not from a request, and prove that rule at the last shared dispatch boundary.
