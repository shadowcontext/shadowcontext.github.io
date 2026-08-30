---
title: "pac4j 6.5.6 Fixes Need Identity-Path Proof"
subtitle: "New authorization fixes show why every token, profile and logout message needs its own validation path."
description: "pac4j 6.5.6 repairs identity-validation gaps across core, OIDC and SAML, making dependency and authentication-path proof the priority."
date: 2026-08-30 06:09:19 +0400
layout: post
category: defense
tags: [identity-security, oidc, saml, java]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-30-pac4j-fixes-need-identity-path-proof.svg
image_alt: "Abstract identity tokens passing through layered violet and cyan verification rings while untrusted paths dissolve at the boundary"
key_points:
  - "pac4j advises upgrading pac4j-core and the OIDC or SAML modules in use to version 6.5.6."
  - "The fixes cover distinct trust decisions for profiles, tokens, subjects, redirects and logout messages."
  - "Defenders should prove both the resolved dependency version and the behavior of each enabled identity flow."
sources:
  - title: "Security advisory for pac4j-core, pac4j-oidc and pac4j-saml"
    publisher: "pac4j · August 2026"
    url: "https://www.pac4j.org/blog/security-advisory-pac4j-core-oidc-saml.html"
  - title: "pac4j-oidc before 6.5.6 Privilege Escalation via Unverified Keycloak Access Token"
    publisher: "CVE Program · August 29, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82461.json"
  - title: "pac4j-core before 6.5.6 Authorization Bypass via Reversed Profile Type Check"
    publisher: "CVE Program · August 29, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82463.json"
  - title: "security"
    publisher: "pac4j source repository · August 2026"
    url: "https://github.com/pac4j/pac4j/commit/2270c3ff70e93cc43831e75702acd5135531237e"
---

Newly published CVE records sharpen the significance of pac4j 6.5.6. The Java security framework’s update does not repair one isolated parser. It reinforces several decisions that determine whether an identity assertion, profile, redirect or logout request should be trusted. For defenders, the right response is an upgrade followed by evidence that every enabled identity path now reaches the intended checks.

## Two high-severity records define the immediate risk

The CVE Program published CVE-2026-82461 and CVE-2026-82463 on August 29. Both records describe versions before 6.5.6 as affected and assign high severity, with CVSS 4.0 base scores of 8.6. Neither record reports exploitation in the wild, so the ratings describe potential technical impact rather than observed compromise.

[CVE-2026-82461](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82461.json) concerns role extraction in pac4j-oidc. The record says Keycloak access-token signatures, issuers, audiences and expiry were not verified before realm and client roles were extracted. In the described condition, a forged access token carrying administrative roles could be paired with a valid ID token and influence authorization in an application that relied on those roles.

[CVE-2026-82463](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82463.json) concerns `CheckProfileTypeAuthorizer` in pac4j-core. The record says reversed profile-type validation could let a user authenticated through a weaker client satisfy a resource check intended for a stronger profile type. That is a useful reminder that successful authentication is not interchangeable with proof that the expected authenticator and assurance path produced the profile.

## One release repairs several trust boundaries

The project’s [security advisory](https://www.pac4j.org/blog/security-advisory-pac4j-core-oidc-saml.html) tells users to upgrade `pac4j-core`, plus `pac4j-oidc` or `pac4j-saml` when those protocols are used. It identifies 6.5.6 as the version containing the security fixes and hardening.

The corresponding [patch commit](https://github.com/pac4j/pac4j/commit/2270c3ff70e93cc43831e75702acd5135531237e) gives defenders a broader map of the repaired surface. Its release notes say the update corrects the reversed profile-type check, validates a Keycloak access token before adding roles, compares a UserInfo subject with the ID-token subject when available, and stops an OIDC callback from accepting an access token without an authorization code or ID token.

The same release notes also describe an open-redirect fix and stronger handling for SAML logout: an unsigned `LogoutRequest` can no longer destroy a session based on `NameID` in the stated no-`SessionIndex` condition unless its signature is validated. These are separate controls, but they share one principle: data that arrives inside an identity protocol is not trusted merely because another part of the exchange was valid.

## Upgrade the modules that actually carry identity

Start with dependency resolution, not application names. Search Maven and Gradle manifests, lock data, software bills of materials and built artifacts for pac4j modules. Framework adapters can introduce pac4j transitively, while separately pinned modules can leave `core`, `oidc` and `saml` on different versions. Establish that the resolved runtime set is 6.5.6 or later, rebuild immutable artifacts, redeploy them and retain the resulting digest as evidence.

Prioritize applications where identity claims control administrative or sensitive functions. Inventory which clients create profiles, which authorizers consume profile types, whether Keycloak-derived roles are used, and whether OIDC UserInfo or SAML single logout is enabled. This narrows testing to real trust paths without assuming every application uses every repaired feature.

## Test rejection, not just successful login

After upgrading, run regression tests through each configured identity provider and client type. Confirm legitimate users retain the expected access, but also prove negative cases: a profile from the wrong client type must not satisfy a stronger policy; roles must only appear after token validation; inconsistent subjects must be rejected; incomplete OIDC callbacks must fail; and unvalidated logout messages must not terminate another session.

Review redirect allowlists and observe authentication failures during rollout. A version check proves code availability, while negative tests prove the application’s configuration invokes that code. Together they provide the defensible outcome this release calls for: every identity-derived privilege is bound to the specific validated evidence that is supposed to authorize it.
