---
title: "ownCloud KEV Demands Version and Signing-Key Proof"
subtitle: "A newly exploited authentication flaw makes deployment scope and upgrade evidence the first defensive priorities."
description: "CISA added an ownCloud authentication bypass to KEV; defenders should verify Classic Server versions, signing-key handling, and access logs."
date: 2026-08-28 05:09:52 +0400
layout: post
category: defense
tags: [owncloud, kev, authentication, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-28-owncloud-kev-needs-version-and-key-proof.svg
image_alt: "Abstract file tiles behind a luminous access boundary as a sealed signing key closes an incoming link path"
key_points:
  - "CISA added CVE-2023-49105 to its Known Exploited Vulnerabilities catalog on August 27."
  - "The vendor advisory identifies ownCloud core 10.6.0 through 10.13.0 as affected."
  - "Defenders should prove deployment type and version, then review file activity after updating."
sources:
  - title: "Known Exploited Vulnerabilities Catalog"
    publisher: "CISA · updated August 27, 2026"
    url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog?search_api_fulltext=CVE-2023-49105"
  - title: "WebDAV Api Authentication Bypass using Pre-Signed URLs"
    publisher: "ownCloud · November 21, 2023"
    url: "https://owncloud.com/security-advisories/webdav-api-authentication-bypass-using-pre-signed-urls/"
  - title: "NVD - CVE-2023-49105"
    publisher: "NIST · updated June 17, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2023-49105"
---

An old patch can become today’s priority when exploitation evidence changes. On August 27, the US Cybersecurity and Infrastructure Security Agency added CVE-2023-49105, an ownCloud WebDAV authentication bypass disclosed in 2023, to its Known Exploited Vulnerabilities catalog. Defenders should now treat proof of deployment scope and fixed versions as urgent work, not assume age means the issue has disappeared.

## What the new signal means

CISA’s KEV catalog is an exploitation signal: inclusion means the agency has evidence that a vulnerability has been exploited in the wild. It does not, by itself, describe a campaign, identify affected organizations, or establish what happened in any particular environment. ShadowContext does not infer those details.

The underlying flaw is serious. ownCloud’s advisory says a remote unauthenticated party who knows an account username can access, modify, or delete files when that account has no signing key configured—the default condition described by the vendor. The problem was that the server could accept pre-signed URLs even when the file owner had no signing key. In effect, a mechanism intended to authorize a specific link could succeed without the cryptographic state needed to make that authorization trustworthy.

The vendor lists ownCloud core versions 10.6.0 through 10.13.0 as affected. NIST’s National Vulnerability Database describes versions before 10.13.1 as vulnerable. ownCloud says the corrective behavior is to deny pre-signed URLs when no signing key is configured for the file owner.

## Scope before speed

The first task is to distinguish products and deployments accurately. This CVE concerns ownCloud Server core, commonly called the Classic server line; it should not be casually applied to similarly named clients, hosted services, or ownCloud Infinite Scale. An inventory result that says only “ownCloud” is insufficient for a remediation decision.

For each instance, record the product line, running server version, node count, exposure, and whether traffic reaches it through a proxy or gateway. Then verify every serving node rather than checking only a package repository, deployment manifest, or management console. A load-balanced pool with one stale node remains an incomplete fix.

Configuration review matters, but it must not become a substitute for updating. The vulnerable behavior specifically involves absent signing keys, yet setting or rotating a key is not the remediation stated in the advisory. The durable control is code that rejects a pre-signed request when the required key state does not exist. Upgrade to a currently supported release that includes that behavior, following the vendor’s supported upgrade path, and retain evidence from the running service.

## Verify the file-access boundary

After updating, test the security property safely: pre-signed links should work only under the organization’s intended sharing policy, and requests lacking valid authorization should fail. Use a controlled test account and non-sensitive files. Confirm ordinary authenticated access, link expiry, revocation, and logging as well, so the change does not silently break legitimate sharing or monitoring.

The KEV addition also justifies a focused review using existing audit and storage telemetry. Look for unusual WebDAV file reads, changes, or deletions associated with pre-signed-link handling, especially activity inconsistent with an account’s normal sharing pattern. Preserve relevant application, reverse-proxy, identity, and storage logs according to policy. Neither CISA’s listing nor the vendor advisory provides universal indicators that can prove an environment safe, so a generic scanner result should not be treated as conclusive.

Avoid turning the review into speculation. Unexpected file activity deserves investigation, but it is not automatically proof of exploitation. Escalate findings through the organization’s established incident process and keep the patching record separate from any conclusion about past activity.

## The durable lesson

Pre-signed links are bearer capabilities: possession of a valid link can grant a narrowly scoped action without another interactive login. Their safety depends on correct key initialization, validation, expiry, revocation, and logging. If any one of those assumptions fails open, the convenience layer can cross the file-access boundary.

Closure should therefore require three forms of evidence: no affected server version remains, the relevant request path rejects missing or invalid authorization, and monitoring can explain sensitive file operations. That is stronger than marking a ticket complete—and it directly answers the risk CISA’s new exploitation signal puts back on defenders’ desks.
