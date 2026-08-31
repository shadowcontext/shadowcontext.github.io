---
title: "AshPostgres Tenant Renames Must Fail Closed"
subtitle: "A patched error-handling flaw shows why tenant identity changes need database-backed proof before commit."
description: "AshPostgres 2.13.0 fixes a tenant-rename flaw; defenders should verify rollback, collision handling, and post-upgrade behavior."
date: 2026-08-31 15:11:41 +0400
layout: post
category: defense
tags: [ashpostgres, multitenancy, postgresql, access-control]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-31-ashpostgres-tenant-renames-must-fail-closed.svg
image_alt: "Abstract database chambers separated by luminous tenant boundaries, with one rejected rename path safely returning to its original chamber"
key_points:
  - "AshPostgres versions 0.25.0 through 2.12.x are affected under specific schema-multitenancy conditions."
  - "Upgrade to 2.13.0 and verify that failed tenant renames roll back the entire application transaction."
  - "Treat tenant names as security-sensitive identity bindings, not ordinary editable labels."
sources:
  - title: "Unchecked error in `AshPostgres.MultiTenancy.rename_tenant/3` in AshPostgres commits a failed schema rename, allowing cross-tenant data exposure"
    publisher: "Ash Project · 30 August 2026"
    url: "https://github.com/ash-project/ash_postgres/security/advisories/GHSA-6fqq-j9c4-5766"
  - title: "CVE-2026-78699"
    publisher: "CVE Program / Erlang Ecosystem Foundation · 30 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/78xxx/CVE-2026-78699.json"
---

A high-severity AshPostgres vulnerability turns a rejected database operation into a successful application state. The narrow trigger matters, but the broader lesson matters more: when a tenant identifier selects a data boundary, changing that identifier is a security transaction and must fail closed.

The Ash Project published the advisory on 30 August. There is no claim of exploitation in the advisory, and this article is not reporting an organizational breach.

## What the advisory confirms

CVE-2026-78699 affects `ash_postgres` from version 0.25.0 up to, but not including, 2.13.0. The vulnerable path is `AshPostgres.MultiTenancy.rename_tenant/3`, used in schema-based multitenancy. According to the project advisory, the function issued PostgreSQL's schema rename through a non-raising query, discarded the returned success-or-error value, and then returned success unconditionally.

That mismatch becomes dangerous when an application lets a user drive a tenant rename—for example, by editing an organization slug or subdomain—and the requested name already belongs to another tenant's PostgreSQL schema. PostgreSQL correctly rejects the duplicate schema name. The vulnerable application path can nevertheless proceed as though the rename worked, commit the tenant record with the requested name, and subsequently point that tenant at the other schema.

The official conditions are important. An application must use AshPostgres schema-based multitenancy and expose a user-driven rename capable of colliding with an existing schema. This is not evidence that every AshPostgres deployment is exposed. The CVE record assigns a CVSS 4.0 score of 7.2 and classifies the issue as an unchecked return value.

## Why a database rejection was not enough

The database preserved its own invariant: two schemas did not acquire the same name. The security failure occurred one layer above, where the application treated an unsuccessful infrastructure change as authoritative state.

That distinction should shape reviews of all tenant lifecycle workflows. A tenant slug may look like presentation data, yet it can also select a schema, storage prefix, encryption context, queue namespace, cache partition, or authorization scope. If the visible identity changes while the backing resource does not, later requests can cross a boundary without any database permission check failing.

Defenders should therefore test the whole state transition, not only the SQL statement. A rename is complete only when the database object, application record, routing layer, caches, and audit trail agree. Any failed step should abort the transaction and preserve the previous binding.

## The immediate defensive work

Upgrade affected applications to AshPostgres 2.13.0 or later. The project advisory identifies 2.13.0 as the patched version and says the corrected behavior surfaces the database failure so the surrounding transaction can roll back.

Then determine whether the vulnerable feature is reachable in the deployed application. Inventory uses of schema-based multitenancy and locate actions that call tenant-management or rename behavior. Pay particular attention to editable slugs, custom domains, organization handles, and administrative rename tools. If upgrades cannot be completed immediately, suspend user-controlled tenant renames or enforce a server-side uniqueness reservation before any state change; that is a temporary risk reduction, not a substitute for the fix.

After upgrading, run safe regression tests in a non-production environment. Attempt a rename to an already existing tenant identifier and confirm that the operation returns an error, the original tenant record remains unchanged, and both schemas retain their original bindings. Repeat with a simulated database permission error or lock timeout, because the advisory notes those failures were also swallowed by the vulnerable path.

## Proving the boundary after patching

Version evidence alone is incomplete. Record the resolved `ash_postgres` package version from the deployed artifact, then capture application-level test evidence showing rollback on collisions and database errors. Review logs and metrics for failed rename attempts, but do not infer compromise from an error alone; normal conflicts can produce the same signal.

Finally, make tenant-binding invariants permanent tests. Assert that a tenant record cannot commit a backing identifier unless the corresponding resource transition succeeds, that destination identifiers are unique, and that authorization is re-evaluated after any rename. The durable lesson from CVE-2026-78699 is simple: a lower layer saying “no” must never become an upper layer saying “done.”
