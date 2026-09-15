---
title: "Crawlab's Shared JWT Key Needs an External Boundary"
subtitle: "A newly published critical CVE makes network isolation the immediate control when an authentication secret cannot be rotated."
description: "CVE-2026-90945 affects Crawlab through 0.6.3. Defenders should isolate the service, constrain workers, and require proof of a corrected build."
date: 2026-09-15 13:11:13 +0400
layout: post
category: defense
tags: [Crawlab, authentication, JWT, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-15-crawlab-jwt-key-needs-an-external-boundary.svg
image_alt: "Abstract access tokens converging on a guarded gateway with an isolated signing-key core"
key_points:
  - "CVE-2026-90945 affects Crawlab through 0.6.3 and describes unauthenticated administrator-token forgery."
  - "Changing account passwords does not correct a shared signing key that the application cannot reconfigure."
  - "Restrict access, contain worker privileges, and require evidence of a corrected build before reopening the service."
sources:
  - title: "Crawlab through 0.6.3 Authentication Bypass via Hard-coded JWT Secret"
    publisher: "CVE Program (VulnCheck CNA) · 14 September 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/90xxx/CVE-2026-90945.json"
  - title: "[Security] Hardcoded JWT Secret Allows Arbitrary Token Forgery and Full Admin Takeover"
    publisher: "Crawlab GitHub repository · 13 June 2026"
    url: "https://github.com/crawlab-team/crawlab/issues/1622"
---

A newly published vulnerability record turns Crawlab authentication into an infrastructure-boundary problem, not a password-reset exercise.

CVE-2026-90945 says Crawlab through version 0.6.3 uses a shared JWT signing key that cannot be replaced through configuration or environment variables. The record does not report active exploitation or an organizational incident. It does establish a critical condition defenders can test safely: whether an affected service is reachable and what authority its workers inherit.

## What the new record confirms

The CVE Program published CVE-2026-90945 on 14 September, with VulnCheck acting as the assigning authority. Its record identifies Crawlab versions through 0.6.3 as affected and describes a hard-coded HMAC-SHA256 key used to sign JSON Web Tokens. It rates the issue 9.8 under CVSS 3.1 and 9.3 under CVSS 4.0.

According to the record, a remote unauthenticated attacker with network access could create a token accepted as an administrator token, reach administrative interfaces and ultimately execute code on worker nodes. Those are source claims about vulnerability impact, not evidence that any deployment has been attacked.

The underlying public issue was opened in the project's GitHub repository on 13 June. It says the application contains helpers that appear capable of accepting a different signing key, but the relevant initialization path does not call them. As of this review, the issue is still marked open. The CVE record names affected releases through 0.6.3 but does not identify a fixed release.

## Why password rotation is not enough

JWT verification depends on the signing key, not on the current password of the account represented in a token. Changing an administrator password may improve a separate credential path, but it does not repair a verifier that continues to trust signatures made with a predictable application-wide key.

That distinction matters operationally. A normal credential-rotation ticket can be completed successfully while the vulnerable trust decision remains unchanged. Web application firewalls and stronger login policy also do not correct the cryptographic condition described in the record. They may reduce exposure around it, but they should not be recorded as remediation.

Crawlab coordinates crawler tasks across workers, so the security boundary extends beyond the web interface. Defenders need to map the service identity, worker identities, secrets, mounted filesystems, container-control interfaces and outbound network paths available to the deployment. Administrative access becomes more consequential when the controlled workload can reach production data or powerful orchestration services.

## Put an enforceable boundary around the service

Start by finding every running Crawlab instance, including developer systems, demonstration environments and old containers that may not appear in the formal service catalogue. Record the live application version, listening interfaces, ingress routes and worker topology. A repository manifest or image tag is only a lead; confirm the process and artifact actually running.

Until a maintainer-supported corrected release is available and verified, remove affected instances from internet and broadly shared network access. Permit connections only through an authenticated administrative path used by named operators. Where the service has no current business requirement, stop it rather than accepting an indefinite exception.

Constrain the workers independently. Run them as dedicated, non-privileged identities; remove unnecessary host mounts and orchestration permissions; separate credentials by environment; and allow outbound access only to documented destinations. These measures do not fix authentication, but they reduce what a compromised control decision could reach.

Review gateway, application, identity, container and worker telemetry for unexpected administrative sessions, configuration changes, task creation, child processes or outbound connections. The sources do not provide evidence of exploitation, so detections should be treated as investigative signals rather than proof of compromise.

## Require proof before closure

A future version number alone should not close this finding. Obtain a vendor or maintainer statement that identifies the corrected release and verify that the live deployment uses a unique, replaceable signing secret supplied through a supported mechanism. Test that tokens created before rotation are rejected if the product promises invalidation, and confirm required administrative and worker functions still operate afterward.

Keep the network restriction in place until those checks pass. The durable lesson from CVE-2026-90945 is simple: when an application's identity decision rests on an unchangeable shared secret, the immediate security control has to sit outside the application.
