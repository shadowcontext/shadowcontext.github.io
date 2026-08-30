---
title: "oidcc Fix Requires Signature Proof Behind Encrypted Tokens"
subtitle: "CVE-2026-75759 shows that confidentiality cannot substitute for proof of who issued an identity token."
description: "CVE-2026-75759 affects oidcc before 3.9.0; defenders should verify versions, encrypted-token use, signature enforcement, and login outcomes."
date: 2026-08-30 08:09:40 +0400
layout: post
category: defense
tags: [identity-security, openid-connect, vulnerability-management, authentication]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-30-oidcc-fix-requires-signature-proof.svg
image_alt: "Abstract nested blue token layers surrounding a luminous verified core, with an amber gap closed by a protective signature arc"
key_points:
  - "CVE-2026-75759 affects oidcc from 3.2.0-beta.1 before 3.9.0."
  - "Encryption protects token contents but does not prove which identity provider issued them."
  - "Defenders should verify the running library, affected token paths, and rejection of unsigned encrypted tokens."
sources:
  - title: "Encrypted Unsigned ID Token Accepted Without Signature Verification"
    publisher: "erlef/oidcc · August 30, 2026"
    url: "https://github.com/erlef/oidcc/security/advisories/GHSA-533g-4vf3-xwrj"
  - title: "EEF-CVE-2026-75759"
    publisher: "Open Source Vulnerabilities · August 30, 2026"
    url: "https://osv.dev/vulnerability/EEF-CVE-2026-75759"
---

A newly published identity-library vulnerability draws a hard line between secrecy and trust. CVE-2026-75759 affects `oidcc`, an OpenID Connect client library for Erlang and Elixir, when processing particular encrypted identity tokens and authorization responses. The maintainer says versions from 3.2.0-beta.1 up to, but not including, 3.9.0 are affected; 3.9.0 is patched.

For defenders, the central lesson is broader than one package: successfully decrypting a token does not establish who created it. Authentication still depends on valid issuer signature proof.

## What the advisory establishes

The [maintainer advisory](https://github.com/erlef/oidcc/security/advisories/GHSA-533g-4vf3-xwrj) says `oidcc` could accept an encrypted but unsigned token as validated. The affected paths cover encrypted ID tokens and JWT Secured Authorization Response Mode, commonly shortened to JARM. According to the advisory, the library could decrypt the outer structure, parse unsigned claims inside it, and continue as though a signature had been verified.

That distinction has serious identity consequences. Encryption to a relying party's public key protects content on its way to that party, but a public key is public by design. It does not authenticate the sender. A valid provider signature is the evidence that binds identity claims to the provider authorized to issue them.

The advisory rates CVE-2026-75759 high at 7.6 under CVSS 4.0 and says the flaw could permit impersonation where the required encryption configuration is in use. The [OSV record](https://osv.dev/vulnerability/EEF-CVE-2026-75759) confirms the affected range and fixed version. Neither source reports exploitation in the wild, so teams should treat this as an urgent vulnerability-remediation task, not as evidence that any deployment has been compromised.

## Exposure depends on the real login path

This is not a reason to assume every application using OpenID Connect is equally exposed. The relevant question is whether a deployed application uses affected `oidcc` versions and accepts encrypted ID tokens or JARM responses through the vulnerable validation paths. The maintainer explicitly says UserInfo responses are not affected because their protocol rules differ.

Dependency discovery must therefore reach beyond a direct package search. `oidcc` may arrive through a framework integration, a shared authentication service, or a transitive dependency. Teams should inspect lockfiles and build artifacts, then resolve those records to the code loaded by the running release. A source repository that now declares 3.9.0 does not prove a long-lived container, release bundle, or node has received it.

Configuration evidence matters too. Record the identity providers connected to each application, whether ID-token encryption or JARM is enabled, and which callback component performs validation. This turns a generic version alert into a bounded list of authentication paths with owners and remediation status.

## Patch, redeploy, and test rejection

Upgrade affected deployments to `oidcc` 3.9.0 or later through the application's supported dependency process. Rebuild immutable artifacts, redeploy them, and retain the observed runtime version or artifact digest. Authentication services are often replicated, so confirm that every active instance and recovery image moved forward.

Then test the security property without reproducing offensive techniques in production. In a controlled test environment, use the identity provider's supported conformance tooling or a benign negative fixture to confirm that an encrypted token lacking the required inner signature is rejected. Also confirm that correctly signed and encrypted tokens still complete the intended login flow. The goal is evidence of fail-closed behavior, not merely a successful package installation.

Preserve ordinary identity telemetry during the change: callback validation failures, issuer and audience mismatches, deployment versions, and authentication outcomes. Do not log raw tokens or sensitive claims. A spike in rejection events can support investigation, but it cannot by itself distinguish probing from a configuration error.

## Make signature verification an invariant

CVE-2026-75759 exposes a recurring review hazard in layered security formats. Engineers may see a successfully decrypted outer object and unconsciously carry that success into an authenticity decision. Those are separate properties and should remain separate in code, tests, and operational evidence.

Identity teams can turn that lesson into a durable control. Define which token types require signatures, reject missing or unverifiable signatures before claims drive a session, and include negative cases for every supported nesting combination. Track the exact validator and version responsible for each login route. Encryption can keep identity data confidential; only verified issuer authentication should make its claims trustworthy.
