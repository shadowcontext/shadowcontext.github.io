---
title: "Scriban Property Writes Need Behavior-Level Proof"
subtitle: "A newly published CVE conflicts with its maintainer advisory on whether a version upgrade closes a template-to-object write boundary."
description: "CVE-2026-73061 exposes a patch-status conflict, making behavior tests and safer object projection essential for Scriban hosts."
date: 2026-08-17 05:09:37 +0400
layout: post
category: defense
tags: [vulnerability-management, dotnet, template-security, access-control]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-17-scriban-property-writes-need-behavior-level-proof.svg
image_alt: "Abstract template ribbons stopped at layered glass boundaries around a luminous live application object"
key_points:
  - "CVE-2026-73061 describes unauthorized writes from Scriban templates into live CLR objects."
  - "Primary sources conflict on whether version 7.2.2 is a complete fix."
  - "Defenders should isolate template data and verify prohibited writes with behavioral tests."
sources:
  - title: "Scriban before 7.2.2 Arbitrary Property Write via TypedObjectAccessor"
    publisher: "VulnCheck via CVE Program · 16 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/73xxx/CVE-2026-73061.json"
  - title: "Template Writes to Arbitrary CLR Properties via `TypedObjectAccessor` (Mass Assignment + `private` / `init` / `internal` Setter Bypass)"
    publisher: "Scriban · 30 May 2026"
    url: "https://github.com/scriban/scriban/security/advisories/GHSA-7jvp-hj45-2f2m"
  - title: "7.2.2"
    publisher: "Scriban · 29 May 2026"
    url: "https://github.com/scriban/scriban/releases/tag/7.2.2"
---

A template engine becomes part of an application's authorization boundary when templates can touch live objects. A newly published CVE for Scriban makes that risk concrete—and also exposes a disagreement between primary sources that defenders must resolve with evidence rather than a version string.

## What the new CVE establishes

The CVE Program published CVE-2026-73061 on 16 August. Its record describes an access-control flaw in Scriban's `TypedObjectAccessor`, which connects template-visible members to Common Language Runtime objects in a host application. According to the record, versions before 7.2.2 can let template code write properties without respecting the intended visibility of their setters.

The maintainer advisory explains the boundary failure more precisely. A property with a public getter may be exposed for both reading and writing. The write path can reach properties whose setters are private, internal, or intended only for object initialization. Changes land on the live object and remain after rendering completes. Publicly settable properties also present a mass-assignment risk because the host lacks a separate read-versus-write member filter, the advisory says.

That does not make every Scriban application remotely exploitable. Exposure requires attacker-influenced template code to reach a context containing a live CLR object with security-relevant state. A service that renders only trusted templates, or projects data into inert values without sensitive setters or methods, has a different risk profile. Inventory must therefore connect package versions to actual rendering paths and object exposure.

## The patch status is not settled by one field

The primary records disagree about remediation. The CVE record identifies 7.2.2 as unaffected, and the advisory page's metadata lists 7.2.2 as the patched version. Yet the body of the same maintainer advisory says that no patched version exists. It proposes checks for setter visibility and separate write controls, but does not state that those controls shipped.

The 7.2.2 release notes add another reason for caution: they list a clarification of `MemberFilter` sandbox limitations, not a code correction for property writes. This does not prove that 7.2.2 remains vulnerable; release notes can be incomplete, and advisory text can lag metadata. It does mean defenders should not claim closure solely because a scanner observes 7.2.2.

Until the maintainer reconciles those statements, treat the version as a candidate baseline to test, not conclusive remediation. Record which source supports the deployment decision and preserve the behavioral result alongside the software inventory.

## Reduce what templates can reach

The strongest immediate control is architectural. Do not place domain entities, identity objects, configuration objects, or other mutable application state directly into an untrusted template context. Build a dedicated view model containing only the values required for output, preferably as immutable scalars or copied data. The template should operate on a presentation surface, not the application's source of truth.

Keep template authorship and template input separate in the threat model. A template stored by an administrator is not automatically safe if an import, synchronization process, plug-in, or delegated editor can alter it. Conversely, user-controlled data is not equivalent to user-controlled template code unless the application evaluates that data as a template.

Where untrusted rendering is necessary, isolate it from privileged services and secrets. Give the rendering process minimal network, filesystem, and identity permissions. That containment limits consequences if another template-to-host boundary fails, while still leaving application-level authorization responsible for sensitive state changes.

## Prove the boundary after every change

Add regression tests built around forbidden outcomes. A template given a representative view model should be unable to change private-set, internal-set, or initialization-only properties, and should not mutate public properties that are intended to be read-only in the rendering workflow. After rendering, assert the original host-side values—not merely the rendered output.

Run those tests against the exact package artifact and runtime used in production. Cover synchronous and asynchronous rendering paths where both exist, plus any compatibility mode the application enables. A passing dependency scan establishes version presence; it does not establish that the dangerous behavior is absent.

Finally, monitor for unexpected template changes and authorization-sensitive state transitions after rendering. Logging should identify the template revision and rendering component without recording secrets or full sensitive objects. For CVE-2026-73061, the defensible completion criterion is simple: the deployed system must demonstrate that templates can read only the intended surface and cannot write back into protected application state.
