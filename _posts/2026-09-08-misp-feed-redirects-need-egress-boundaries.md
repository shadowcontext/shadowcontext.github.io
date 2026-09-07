---
title: "MISP Feed Redirects Need Explicit Egress Boundaries"
subtitle: "A new SSRF advisory shows why outbound trust must be re-evaluated at every redirect hop."
description: "CVE-2026-86419 fixes MISP feed and TAXII URL validation. Defenders should verify the patch, restrict egress and review feed credentials."
date: 2026-09-08 02:11:35 +0400
layout: post
category: defense
tags: [misp, ssrf, threat-intelligence, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-08-misp-feed-redirects-need-egress-boundaries.svg
image_alt: "Abstract blue intelligence streams passing through guarded redirect gates while amber credential tokens remain inside a protected boundary"
key_points:
  - "CVE-2026-86419 affects MISP versions through 2.5.45 and covers feed redirects plus TAXII discovery."
  - "The fix validates redirect destinations, blocks unsafe cross-host hops and removes feed credentials before changing hosts."
  - "Defenders should verify patch inclusion, constrain server egress and review credentials attached to remote feeds."
sources:
  - title: "MISP Insufficient Outbound URL Validation Allows SSRF and Credential Disclosure via Feed Redirects and TAXII Discovery"
    publisher: "CIRCL · 7 September 2026"
    url: "https://cve.circl.lu/vuln/CVE-2026-86419"
  - title: "fix: [security] Stop feed redirects leaking credentials and reaching internal hosts"
    publisher: "MISP · 7 September 2026"
    url: "https://github.com/MISP/MISP/commit/08d6efe24"
  - title: "fix: [security] Put the TAXII discovery check on the shared validator"
    publisher: "MISP · 7 September 2026"
    url: "https://github.com/MISP/MISP/commit/06f541dcf"
---

A newly published MISP advisory turns an ordinary integration feature into an egress-control problem. CVE-2026-86419 describes weaknesses in remote feed redirects and TAXII discovery that could let server-side requests reach unintended destinations. In one path, credentials configured for a feed could also follow a redirect to a different host.

The finding is not evidence of exploitation or an organizational breach. It is a focused vulnerability disclosure with a useful lesson for every platform that retrieves security data: approving the first URL is not enough when later network destinations can change.

## What the advisory establishes

CIRCL’s CVE record marks MISP versions through 2.5.45 as affected and assigns a CVSS 4.0 score of 7.0. It says feed processing followed redirects without validating each new scheme and destination. Because the original request headers were reused, authentication headers or API credentials configured for the feed could be sent to another host. A redirect could also point the MISP server toward an internal resource, creating a server-side request forgery boundary failure.

The same record identifies a related weakness in TAXII discovery. The earlier check resolved a hostname with `gethostbyname()` and compared the result with only a small set of literal addresses. According to the advisory and patch, that missed IPv6 loopback, alternative numeric representations and cases involving multiple DNS records.

The vendor commits show the repair. MISP now resolves and evaluates redirect targets itself, applies a shared outbound-URL validator, refuses unsafe cross-host destinations, removes configured feed credentials before a request moves to another host, and pins the validated address to reduce re-resolution risk. TAXII discovery now uses the same validator instead of its narrower bespoke check.

## Treat redirects as new authorization decisions

Redirects are often handled as transport details, but they can change the security meaning of a request. A site administrator may approve a feed host and intentionally attach a token to it. That decision does not authorize a third party named in a later `Location` response to receive the same token or select an internal destination.

Defenders should inventory MISP instances and identify configured feeds and TAXII servers, including integration, test and recovery systems. Record which feeds carry authorization headers or API credentials, which destinations are internal, and what outbound network paths the MISP host can reach. This creates the context needed to prioritize the update without treating every installation as equally exposed.

The CVE record does not name a fixed release. Do not assume that “latest” proves remediation. Confirm that the deployed package contains commits `08d6efe24` and `06f541dcf`, or wait for an explicitly documented release or distributor backport that includes both changes. If that mapping is unavailable, restrict who can configure remote sources and narrow the server’s outbound access while the supported update path is confirmed.

## Review egress and credential exposure

Application validation should sit inside a second boundary enforced by the network. Permit the MISP service to reach only required feed, TAXII, proxy and update destinations where practical. Block cloud metadata, loopback and unnecessary private-address paths at the host or network layer. Route outbound HTTP through a controlled proxy when that fits the deployment, and log destination changes without recording secrets.

Review feed credentials as scoped capabilities. Prefer tokens limited to the required dataset and operations, keep them distinct across providers, and rotate a credential when evidence shows it was attached to a request that crossed to an unexpected host. The advisory alone does not prove that any token was disclosed, so rotation decisions should follow configuration and log evidence rather than speculation.

## Prove the repaired path safely

After updating, test with benign infrastructure under defender control. Verify that an approved same-host redirect still works where intended, a cross-host redirect does not carry the original authorization header, and prohibited destinations are rejected. Confirm TAXII discovery continues to work for approved internal or external services under the deployment’s policy.

Capture the installed build, patch provenance, service restart and test results. Avoid reproducing dangerous targets or placing real credentials in test traffic. The durable control is broader than this CVE: every redirect is a fresh authorization decision, and every server-side fetch needs both application-level validation and a constrained network route.
