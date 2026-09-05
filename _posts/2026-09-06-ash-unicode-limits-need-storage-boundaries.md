---
title: "Ash Unicode Flaw Makes String Length a Storage Boundary"
subtitle: "A grapheme-counting mismatch shows why visual length cannot stand in for resource limits."
description: "CVE-2026-82752 shows why Ash applications need aligned character, byte, request, and storage limits for untrusted Unicode input."
date: 2026-09-06 01:10:13 +0400
layout: post
category: defense
tags: [ash-framework, unicode, input-validation, resource-exhaustion]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-06-ash-unicode-limits-need-storage-boundaries.svg
image_alt: "Abstract Unicode character cluster widening into luminous data strands before a protected storage chamber"
key_points:
  - "Ash versions from 0.10.0 before 3.33.0 can undercount the resource size of some Unicode strings."
  - "Fields without an independent storage limit can accept far more data than a grapheme cap implies."
  - "Defenders should align request, byte, code-point, and database limits, then test each boundary."
sources:
  - title: "CVE Record: CVE-2026-82752"
    publisher: "CVE Program · September 5, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-82752"
  - title: "ash versions"
    publisher: "Hex · accessed September 6, 2026"
    url: "https://hex.pm/packages/ash/versions"
---

A newly published Ash framework vulnerability turns a subtle Unicode distinction into a resource-control problem. The immediate task is to update affected applications, but the broader lesson is more durable: a limit expressed in visible characters does not necessarily limit bytes, code points, request size or stored data.

## What the CVE establishes

The CVE Program record for CVE-2026-82752 describes an improper input-validation issue in Ash, a framework for Elixir applications. It affects Ash versions from 0.10.0 up to, but not including, 3.33.0. The record rates the issue medium severity at 5.9 under CVSS 4.0.

Ash used Elixir's `String.length/1` for several string-length checks, including constraints in `Ash.Type.String`, the `Ash.Resource.Validation.StringLength` validation and the `string_length` expression function. That function counts grapheme clusters: units intended to approximate what a reader perceives as one character.

That is useful for interface rules, but it is not a resource measurement. One displayed character can be represented by a base code point plus many combining code points. The CVE record says such a value could satisfy a small grapheme limit while occupying much more memory and storage than the application designer intended.

The consequence depends on the data layer. The record specifically identifies ETS, Mnesia and PostgreSQL `text` columns as examples without an independent value-length boundary in this scenario. A PostgreSQL `varchar(n)` column supplies its own limit and is not exposed in the same way. No organizational compromise or in-the-wild exploitation is asserted by the cited sources.

## Why one word, character or byte is not another

Application teams often write “maximum length” as though length had one universal meaning. Unicode makes that assumption unsafe. A grapheme count answers a presentation question; a code-point count describes encoded characters at another layer; a byte count determines transport, allocation and storage cost. All three can differ for the same input.

CVE-2026-82752 matters because a user-facing rule was also expected to serve as an availability control. Where no downstream component imposed a separate ceiling, the semantic mismatch allowed data to grow beyond that control's intended resource budget. Where a database did enforce a different unit, accepted application input could instead fail at persistence. That creates both denial-of-service risk and unpredictable error paths.

Normalization alone should not be treated as a complete fix. It may make equivalent text representations more consistent, but defenders still need an explicit ceiling tied to the resource they are protecting. A display-name policy, an HTTP body cap and a database column limit solve different problems.

## What defenders should do now

Inventory applications that depend on Ash, including resolved transitive versions in deployed release artifacts. The CVE record identifies 3.33.0 as the fixed boundary. Confirm that the corrected version exists in the trusted package registry, is locked into the build and is actually loaded by each running instance; a changed dependency declaration is not runtime proof. Hex's version history provides an independent place to verify published package versions.

Until every deployment is updated, reduce exposure with layered limits. Set a request-body ceiling before application parsing, cap bytes for attacker-controlled strings where memory or storage is the concern, and use database constraints appropriate to the column's purpose. Rate limits and quotas can constrain repeated consumption, but they should supplement rather than replace per-value bounds.

Avoid a blanket ban on combining characters. Legitimate writing systems rely on Unicode composition, and indiscriminate filtering can turn a security repair into an accessibility or internationalization defect. The safe objective is bounded resource use, not ASCII-only input.

## Prove the whole input path is bounded

Regression testing should cover every affected Ash validation path named by the record, not just a single form. Use safe, controlled test fixtures containing equivalent text representations and strings whose grapheme, code-point and byte counts differ. Verify consistent rejection before expensive processing and confirm that API, background-job and bulk-import paths enforce the same budgets.

Then observe the storage boundary directly. Check that oversized values do not reach persistence, that database rejections become controlled application errors, and that logs record sizes without copying entire hostile values. Monitor memory, request latency and storage growth during the test.

The closure condition is alignment: the interface may count what people see, while infrastructure limits what systems must carry. CVE-2026-82752 is a compact reminder that both measurements are valid—and neither can safely substitute for the other.
