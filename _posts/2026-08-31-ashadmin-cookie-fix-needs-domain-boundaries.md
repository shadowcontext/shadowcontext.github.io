---
title: "AshAdmin Cookie Fix Needs Domain-Boundary Proof"
subtitle: "A new session-shadowing fix shows why sibling subdomains cannot be treated as harmless neighbors."
description: "AshAdmin 1.3.1 fixes cookie-name shadowing that could alter admin session context, making version and domain-boundary proof immediate priorities."
date: 2026-08-31 11:10:23 +0400
layout: post
category: defense
tags: [ashadmin, session-security, cookie-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-31-ashadmin-cookie-fix-needs-domain-boundaries.svg
image_alt: "Abstract admin interface protected by an exact-match gateway while a shadow cookie from a sibling domain is diverted"
key_points:
  - "CVE-2026-75757 affects AshAdmin versions from 0.9.1 before 1.3.1."
  - "A sibling subdomain could shadow security-relevant cookie names and alter admin session context."
  - "Upgrade, verify the deployed asset, and reduce parent-domain cookie trust across subdomains."
sources:
  - title: "Cookie-name substring matching in AshAdmin client JS allows a sibling subdomain to rebind the session actor/tenant"
    publisher: "Ash Project · 31 August 2026"
    url: "https://github.com/ash-project/ash_admin/security/advisories/GHSA-3259-55fp-w94j"
  - title: "v1.3.1"
    publisher: "Ash Project · 31 August 2026"
    url: "https://github.com/ash-project/ash_admin/releases/tag/v1.3.1"
---

AshAdmin has fixed a high-severity session-context vulnerability caused by imprecise cookie-name matching. The flaw is a focused reminder that an administrative application does not stand alone when it shares a registrable domain with other services: a weaker sibling subdomain can influence the browser state presented to the stronger application.

The immediate task is to move affected deployments to version 1.3.1. The lasting task is to prove that session identity, tenant selection and authorization state cannot be supplied through ambiguous browser data.

## What the advisory establishes

The Ash Project published CVE-2026-75757 on August 31 and rates it High at 8.3 under CVSS 4.0. The affected range is AshAdmin 0.9.1 up to, but not including, 1.3.1; version 1.3.1 is patched. The advisory does not claim exploitation in the wild, so this publication is a remediation signal, not evidence that any deployment has been compromised.

AshAdmin is a super-admin interface for applications built with the Ash framework and Phoenix LiveView. According to the maintainer, its client-side cookie reader searched the browser's complete cookie string for a requested name without enforcing an exact name boundary. A cookie whose name merely ended with an expected name could therefore be selected before the legitimate value.

Those values were not cosmetic. The advisory says they could flow into LiveSocket connection parameters covering the actor, tenant and authorization mode. Under the stated preconditions, an attacker able to set a parent-domain cookie from a sibling subdomain could cause an administrator's browser to present different session context to AshAdmin. The fix changes lookup behavior to compare cookie names exactly.

## Why the sibling-domain condition matters

This is not a universal remote takeover of every AshAdmin installation. The attack requirement is meaningful: another subdomain under the same registrable domain must be attacker-controlled or otherwise able to set a broadly scoped cookie, and browser cookie ordering must favor the shadowing value. Exposure therefore depends on both software version and domain architecture.

That architecture is often less tidy than an application inventory suggests. Marketing sites, preview environments, customer-content hosts, acquired services and abandoned DNS records may sit beside an administrative console under one parent domain. A team can harden the admin host while leaving a neighboring service with a weaker ownership, deployment or content model.

Cookie scope joins those services into one browser trust surface. Hostnames separate routing, but a broadly scoped cookie can cross that apparent boundary. Defenders should map who controls every sibling name, which applications can emit parent-domain cookies, and whether untrusted content is hosted anywhere inside the same namespace. A subdomain that has no network route to the admin service may still matter to browser security.

## Patch and verify the running path

Upgrade AshAdmin through the application's supported dependency process to 1.3.1 or later. Rebuild and redeploy the application rather than treating a lockfile edit as completion. Because the vulnerable logic is shipped in a client asset, verification should include the exact package resolved during the build and the static asset actually served by each production instance.

The 1.3.1 release contains several other security fixes, including corrections for file-name handling, rendered labels, content-security-policy nonces and client-driven event values. That makes it important to take the complete supported release rather than transplanting one change without the maintainer's full regression coverage.

If an upgrade cannot be completed immediately, isolate the admin interface on a dedicated registrable domain where unrelated or user-controlled siblings cannot set shared cookies. Review parent-domain cookie issuance and remove unnecessary broad `Domain` attributes through normal configuration controls. These measures reduce the relevant trust surface, but they do not replace the exact-name fix.

## Make session context a server-verified claim

After deployment, test the security invariant rather than only the happy-path login: differently named cookies must not change the actor, tenant or authorization state selected for an administrator. Use a benign staging check, observe the server-side identity decision, and retain the result alongside the deployed version and asset digest.

More broadly, browser-supplied context should identify a server-held session, not independently decide privileged identity. Where frameworks expose actor or tenant selectors, the server should bind them to the authenticated principal and re-evaluate authorization for the requested operation. Exact parsing removes this vulnerability; server-side binding limits the consequence of the next client-state mistake.
