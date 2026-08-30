---
title: "AshPaperTrail Fixes Need Audit-Data Boundary Proof"
subtitle: "Three new advisories show that an audit trail must protect sensitive data and bound the cost of recording change."
description: "AshPaperTrail 0.7.0 fixes two sensitive-data paths and a full-diff availability flaw, making audit access and input limits urgent checks."
date: 2026-08-30 09:08:44 +0400
layout: post
category: defense
tags: [vulnerability-management, audit-logging, data-protection, elixir]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-30-ashpapertrail-fixes-need-audit-data-boundaries.svg
image_alt: "Abstract violet audit layers held inside a cyan protective boundary while amber data fragments are filtered at the edge"
key_points:
  - "AshPaperTrail 0.7.0 fixes three vulnerabilities published on August 30."
  - "Two flaws could leave sensitive values readable in generated version records."
  - "Defenders should verify versions, audit-resource access, redaction behavior and array limits."
sources:
  - title: "Sensitive information exposure in AshPaperTrail stores sensitive attribute values in a non-sensitive public changes map"
    publisher: "Ash Project · August 30, 2026"
    url: "https://github.com/ash-project/ash_paper_trail/security/advisories/GHSA-wqjr-xmxp-j554"
  - title: "Sensitive information exposure in AshPaperTrail stores nested sensitive values in plaintext in the version table"
    publisher: "Ash Project · August 30, 2026"
    url: "https://github.com/ash-project/ash_paper_trail/security/advisories/GHSA-v645-6jm6-cgpj"
  - title: "Uncontrolled resource consumption in the AshPaperTrail full-diff list builder via a large array attribute"
    publisher: "Ash Project · August 30, 2026"
    url: "https://github.com/ash-project/ash_paper_trail/security/advisories/GHSA-7c66-59m8-723c"
---

Three newly published AshPaperTrail advisories turn a routine dependency update into a broader test of audit-system design. Version 0.7.0 fixes two paths that could preserve sensitive values in generated version records and a separate full-diff path that could consume excessive CPU and memory.

The practical lesson is direct: an audit trail is another data store and another processing surface. Teams must prove what it records, who can read it, and how much work one accepted change can force it to perform.

## Two flaws weaken the confidentiality boundary

AshPaperTrail is an extension that records changes to resources in applications built with the Ash framework. [CVE-2026-75847](https://github.com/ash-project/ash_paper_trail/security/advisories/GHSA-wqjr-xmxp-j554) concerns versions from 0.1.1 up to, but not including, 0.7.0. The maintainer says the generated version resource could mark its `changes` map as public and non-sensitive even when that map held tracked attributes declared `sensitive?` by the application. Read actions, logs, inspection output or errors could therefore reveal values that the framework was expected to redact.

The configuration conditions matter. A tracked resource must contain a sensitive attribute that is not excluded from change tracking, and someone must have a path to read or otherwise expose the version record. The advisory rates the issue moderate at 5.9 under CVSS 4.0. It does not report exploitation, so the disclosure should trigger verification rather than unsupported assumptions about compromise.

[CVE-2026-77970](https://github.com/ash-project/ash_paper_trail/security/advisories/GHSA-v645-6jm6-cgpj) reaches a related result through a different path. In versions from 0.3.0 before 0.7.0, redaction or exclusion applied only to top-level fields. A non-sensitive container could therefore carry an embedded, union, map or list value containing a sensitive field, and that nested value could be written to the version table in plaintext. Stored action inputs followed the same shallow logic.

These are not interchangeable findings. One concerns how the generated `changes` field is classified; the other concerns whether redaction descends through structured values. A useful regression test needs to cover both.

## Full-diff tracking adds an availability condition

The third advisory, [CVE-2026-77831](https://github.com/ash-project/ash_paper_trail/security/advisories/GHSA-7c66-59m8-723c), affects versions from 0.1.1 before 0.7.0 when a resource uses full-diff tracking and accepts an array without an effective length bound. The maintainer found that pairing old and new list elements repeatedly rebuilt a growing accumulator, causing processing cost to scale poorly as the array grew.

The advisory rates this issue low at 2.1 under CVSS 4.0, but the deployment condition is more useful than the score. Exposure requires an action through which a requester can submit a large accepted array to a paper-trailed create or update. Teams not using full-diff mode, or those enforcing practical array limits before the tracking code runs, have a different risk profile.

This also explains why generic rate limiting is incomplete. A small number of unusually expensive requests may matter more than a large number of ordinary ones. Input-size constraints, request budgets and workload telemetry should complement request-count controls.

## Upgrade, then test the generated resource

All three advisories identify 0.7.0 as the patched version. Defenders should verify the resolved dependency in the built artifact and the version actually running; a changed manifest alone is not deployment proof.

Next, inventory resources using AshPaperTrail and classify their tracked fields. Test that top-level and nested sensitive values do not appear in version reads, serialized API responses, logs, exception output or exports. Review authorization on every generated version resource independently of the source resource, because historical data can have different readers and retention rules.

For resources using full-diff mode, identify accepted array attributes and enforce limits at the earliest trusted boundary. Exercise representative maximum-size updates while watching latency, CPU and memory. The goal is not merely a green unit test, but evidence that the production path remains bounded.

## Audit data needs its own lifecycle

Patching stops new records from following the vulnerable behavior; it does not establish what earlier version rows contain. Without presuming exposure, teams should assess whether historical audit records may include sensitive top-level or nested values, then apply their approved data-handling process to access, retention and cleanup decisions.

That review should preserve the audit trail's integrity and legal purpose. Avoid ad hoc deletion. Coordinate with data owners, compliance teams and application maintainers, restrict access while the assessment proceeds, and document any controlled migration or redaction.

The lasting defensive lesson is that “audit” does not automatically mean “safe.” Version history needs the same explicit schema, authorization, minimization, retention and resource-consumption boundaries as the primary application data it is meant to explain.
