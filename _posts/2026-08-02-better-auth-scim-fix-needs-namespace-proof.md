---
title: "Better Auth SCIM Fix Needs Namespace-Level Proof"
subtitle: "A critical authorization flaw shows why identity-provider names must be governed as security boundaries, not treated as labels."
description: "CVE-2026-67330 in Better Auth's SCIM plugin makes version checks, provider-ID review and deprovisioning tests immediate identity controls."
date: 2026-08-02 11:09:44 +0400
layout: post
category: defense
tags: [identity-security, scim, authorization, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-02-better-auth-scim-fix-needs-namespace-proof.svg
image_alt: "Abstract identity nodes separated into protected cyan namespaces while an amber collision path is stopped at a central authorization boundary"
key_points:
  - "CVE-2026-67330 affects specified Better Auth SCIM versions when provider namespaces and authorization ownership can collide."
  - "The maintainer fixed the flaw in 1.6.22 and the 1.7 release-candidate line."
  - "Defenders should verify versions, inspect provider IDs and test that deprovisioning actually ends access."
sources:
  - title: "@better-auth/scim: account takeover and stale access via SCIM provider-id collision"
    publisher: "GitHub · June 26, 2026"
    url: "https://github.com/better-auth/better-auth/security/advisories/GHSA-rjg6-39jm-rgg4"
  - title: "NVD - CVE-2026-67330"
    publisher: "NIST National Vulnerability Database · August 1, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2026-67330"
---

A newly published CVE record puts a fresh identifier on a serious identity-boundary problem in Better Auth's SCIM plugin. CVE-2026-67330 covers an authorization bypass in which a SCIM provider identifier could collide with another account-provider namespace, allowing a token to reach users it did not provision.

The immediate task is patching, but the durable lesson is broader. In identity systems, a provider name can become an authorization key. Defenders must inventory and test that namespace with the same care they apply to roles, tokens and tenant identifiers.

## What is affected

The maintainer's advisory lists stable `@better-auth/scim` releases from 1.4.0-beta.27 through 1.6.21 as affected, along with 1.7 beta releases through 1.7.0-beta.9. It says applications are exposed to the provider-ID collision when they register the SCIM plugin, allow authenticated users to generate SCIM tokens, and have existing account rows under a colliding SSO, SAML, OIDC, generic OAuth or social-provider ID.

That scope matters. This is not a claim that every Better Auth installation is vulnerable, nor that every deployment has the same reachable paths. Teams should establish whether the scoped SCIM package is installed, record its resolved version from the deployed artifact or lockfile, and confirm whether users can generate SCIM tokens. They should then compare configured and stored provider identifiers across all supported identity methods.

The advisory also describes two related SCIM write-path issues. A deactivation request using `active: false` could appear successful while access and sessions remained active, and SCIM email updates did not use the same uniqueness and verification handling as account creation. These conditions make an upgrade more than a package-number exercise: the resulting identity state also needs verification.

## The fix restores ownership boundaries

The maintainer identifies 1.6.22 and the 1.7 release-candidate line as patched. The NVD record, published August 1, assigns CVE-2026-67330 and describes the fixed stable and beta paths. Because package managers can retain a vulnerable transitive or explicitly pinned version, defenders should verify the version actually loaded in each deployed service rather than relying on a changed manifest alone.

According to the maintainer, the patch rejects SCIM provider IDs that collide with built-in, social, generic OAuth and SSO provider namespaces before token creation. It also narrows deletion to the relevant SCIM account link when a user has other identities. A global user is deleted only when the SCIM account is the sole linked identity.

The update further maps SCIM deactivation to an enforced disabled-user state and revokes sessions when the required admin capability is present. If that capability is absent, the request is rejected instead of being silently ignored. Email changes now receive a uniqueness check and reset the verification state. Together, those changes re-establish an important rule: a provisioning channel may manage only the identities it owns, and successful control-plane responses must match real access state.

## Verify more than the package

Start with a deployment inventory covering every service that embeds Better Auth. Record the application, environment, resolved `@better-auth/scim` version, SCIM exposure, token-generation policy and configured identity providers. Upgrade affected instances through the project's normal tested release process, then confirm the running artifact reports or contains the expected patched dependency.

Next, review stored `scimProvider` records and compare every `providerId` with identifiers used by built-in login, social providers, SSO, SAML, OIDC and generic OAuth. The maintainer advises removing SCIM provider rows that collide with another provider namespace. Treat that cleanup as an identity change: preserve an audit trail and validate intended provisioning before altering production records.

If an immediate upgrade is impossible, the advisory recommends restricting who can generate SCIM tokens and configuring the generation policy to reject IDs already used anywhere else in the application. This is a temporary risk reduction, not a substitute for the corrected code. Broad domain-based account linking should also be avoided because a shared email domain does not establish that a SCIM token owns an existing user.

## Make deprovisioning observable

Run a controlled lifecycle test after remediation. Provision a test identity through SCIM, establish a session, deactivate the identity through the normal identity-provider workflow, and verify at the application that the account is disabled and its sessions no longer work. Check both organization-scoped and non-organization flows that the deployment actually uses. The goal is evidence of the outcome, not merely a successful SCIM response.

Monitoring should distinguish token creation, provider-configuration changes, SCIM writes, account-link changes and session revocation. Alert on attempted provider-ID collisions or unexpected token creators, while keeping sensitive token values out of logs. Review past deactivation results cautiously; the maintainer specifically warns not to rely on earlier success reports until the deployment is upgraded.

CVE-2026-67330 is a reminder that identity automation is authorization automation. A clean version check closes the known flaw; namespace governance and end-to-end deprovisioning evidence keep the same boundary from failing quietly elsewhere.
