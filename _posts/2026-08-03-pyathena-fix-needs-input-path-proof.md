---
title: "PyAthena Fix Needs Proof Across the Input-to-Query Path"
subtitle: "A critical formatter flaw makes dependency inventory and data-flow review equally important."
description: "CVE-2026-65321 is fixed in PyAthena 3.35.4, but defenders must also verify where untrusted values can reach generated Athena queries."
date: 2026-08-03 18:11:33 +0400
layout: post
category: defense
tags: [pyathena, sql-injection, python, cloud-security]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-03-pyathena-fix-needs-input-path-proof.svg
image_alt: "Abstract layers of blue data capsules passing through a guarded amber query boundary into a protected cloud database"
key_points:
  - "CVE-2026-65321 affects PyAthena versions before 3.35.4."
  - "Exposure depends on whether untrusted values reach the vulnerable formatter path."
  - "Teams should verify the running package, input boundaries and Athena permissions."
sources:
  - title: "CVE-2026-65321"
    publisher: "CVE Program · 3 August 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-65321"
  - title: "PyAthena · PyPI"
    publisher: "Python Package Index · 31 July 2026"
    url: "https://pypi.org/project/PyAthena/"
---

A newly published vulnerability record puts a sharp boundary around an ordinary-looking software task: turning Python values into SQL for Amazon Athena. CVE-2026-65321 identifies a SQL-injection flaw in PyAthena before version 3.35.4. The immediate action is an upgrade, but reliable remediation also requires proof that the fixed package is running wherever queries are assembled.

## What the record establishes

The CVE record describes improper quote escaping in PyAthena's `DefaultParameterFormatter`. It rates the issue critical and identifies releases before 3.35.4 as affected. PyPI lists 3.35.4 as the current release, published on 31 July, and describes PyAthena as a Python DB API 2.0 client for Amazon Athena.

The security consequence sits at the boundary between data and query syntax. A parameter formatter is supposed to preserve that distinction: supplied values should remain values, even when they contain characters meaningful to SQL. If escaping is incomplete, crafted input can change the structure of the generated statement instead of remaining inert data.

That does not mean every installation exposes an unauthenticated network service. PyAthena is a client library, and real exposure depends on the application around it. A reachable API, job runner, analytics portal or automation service must pass attacker-influenced data into the affected formatting path for the flaw to become exploitable through that route. The privileges attached to the Athena session then shape what a manipulated query could reach.

## Patch the dependency, then prove it

Teams should move affected applications to PyAthena 3.35.4 or later through their normal tested release process. The important word is *applications*: updating a lock file or a shared base image is not evidence that every worker, function, notebook environment and long-running container now loads the corrected library.

Start with a runtime inventory. Record the imported PyAthena version in each production execution class, including ephemeral jobs and serverless packages. Rebuild immutable artifacts, replace rather than merely restart stale workloads where appropriate, and verify the version from inside the deployed environment. Dependency scanners should look through transitive and optional dependency paths, not only top-level project declarations.

Where an immediate upgrade is blocked, reduce exposure without claiming a complete fix. Remove untrusted values from affected query-building flows, pause unnecessary public query features, and narrow the execution role's access. These controls can lower risk, but application-side character filters are a fragile substitute for corrected parameter handling.

## Trace the data-to-query boundary

The highest-value review follows values from their origin to the final Athena call. Identify request fields, uploaded records, queue messages, scheduled-job parameters and stored configuration that can influence a query. Then determine whether those values pass through `DefaultParameterFormatter`, another formatting path, or a separately parameterised interface.

This review should distinguish validation from authorization. A syntactically valid project name, table selector or reporting filter can still be unauthorized for a particular user or tenant. Enforce allowlists for identifiers where the application genuinely offers a finite set, keep user-controlled values separate from SQL structure, and reject unexpected query shapes before execution.

Athena permissions provide the final containment layer. Querying roles should have access only to required workgroups, catalog objects, data locations and result buckets. Separate public-facing services from broad analyst roles. Review whether write-capable statements are needed at all, and ensure query and access logs are retained for security review.

## Verification is the closure condition

A defensible closure record needs more than a package-manager screenshot. It should show the running version, the rebuilt artifact identifiers, the affected input paths reviewed, the role permissions checked and representative regression tests passing.

Tests should use benign edge cases containing quotes and other boundary characters, then confirm they remain data and do not alter statement structure. Avoid copying exploit strings into production tests. Pair those checks with negative authorization tests and monitoring for unusual query shapes, unexpected datasets or activity from application roles outside their normal workgroups.

CVE-2026-65321 is a reminder that parameter handling is part of the security boundary even when it lives inside a familiar client library. The patch repairs the component; inventory, data-flow analysis and least privilege prove that the wider system has actually regained that boundary.
