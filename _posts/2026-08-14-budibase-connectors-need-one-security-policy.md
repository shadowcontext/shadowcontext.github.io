---
title: "Budibase Connectors Need One Security Policy"
subtitle: "Two high-severity flaws show how connector-specific behavior can bypass otherwise sound security controls."
description: "New Budibase CVEs show why secret masking and outbound request controls must hold across every datasource connector and transport."
date: 2026-08-14 11:11:57 +0400
layout: post
category: defense
tags: [budibase, low-code, ssrf, secret-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-14-budibase-connectors-need-one-security-policy.svg
image_alt: "Abstract low-code connector hub with a sealed credential capsule and a network path held inside a luminous security boundary"
key_points:
  - "Budibase versions before 3.40.0 are affected by two newly catalogued high-severity connector flaws."
  - "Secret masking failed for two field types, while DNS pinning failed across two outbound request paths."
  - "Defenders should upgrade, rotate affected credentials where exposure was possible, and enforce an independent egress boundary."
sources:
  - title: "Datasource secrets stored in STRING typed fields (MongoDB connection string, Firebase private key) are returned unredacted by the datasource read API"
    publisher: "Budibase · July 22, 2026"
    url: "https://github.com/Budibase/budibase/security/advisories/GHSA-6mpp-gfg5-x2vv"
  - title: "DNS rebinding SSRF bypasses remain in OpenAPI import and REST query execution"
    publisher: "Budibase · July 22, 2026"
    url: "https://github.com/Budibase/budibase/security/advisories/GHSA-xg5g-26x8-cvf4"
  - title: "CVE-2026-72857"
    publisher: "CVE Program · August 13, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/72xxx/CVE-2026-72857.json"
  - title: "CVE-2026-72855"
    publisher: "CVE Program · August 13, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/72xxx/CVE-2026-72855.json"
---

Two newly published CVE records give fresh identifiers to high-severity flaws in Budibase, the low-code application platform. CVE-2026-72857 concerns datasource secrets returned without redaction; CVE-2026-72855 covers server-side request forgery protections that could be bypassed through DNS rebinding. Both are fixed in version 3.40.0, and together they expose a broader design risk: a central security control is only as strong as its least consistent connector.

## What the advisories establish

Budibase's credential advisory says the platform is intended to remove datasource secrets before returning configuration data to a client. The masking logic recognized fields explicitly typed as passwords or sensitive long-form values. MongoDB connection strings and Firebase private keys, however, were represented as ordinary string fields, so the shared redaction function did not hide them.

The maintainer says versions before 3.40.0 could therefore return those live credentials through datasource read endpoints. The advisory also found that a single-datasource route required only table-read permission, a lower boundary than builder or administrator access. That combination matters more than either detail alone: the secret classification gap became reachable from a comparatively limited application role.

The second advisory describes two outbound request paths that did not preserve the platform's DNS safety decision through to the connection. OpenAPI import validated a hostname and then fetched it separately. A REST integration used an HTTP client path that did not honor the pinned network agent supplied by the common protection. In both cases, a builder-level user could potentially cause the server to reach loopback or private HTTP services that the platform intended to block.

The advisories rate both issues high and list 3.40.0 as the patched version. They do not report observed exploitation or identify affected organizations.

## The shared failure is policy drift

These look like different vulnerability classes—credential exposure and SSRF—but their structure is similar. Budibase had a security policy in each area: sensitive values should not be readable back, and approved hostnames should remain bound to an approved destination. The failure appeared where connector-specific metadata or transport behavior escaped that policy.

This is a common low-code risk. A platform may support many databases, APIs and cloud services, each with different configuration schemas and client libraries. If a field must be labelled sensitive before it is masked, one innocent-looking type declaration can turn into disclosure. If a network guard depends on every HTTP client honoring the same agent option, changing the transport can silently reopen a blocked route.

The safer design is fail-closed. Connector schemas should explicitly allow public configuration fields and treat unknown credential-like values as secret. Outbound request policy should be enforced at the actual socket or egress boundary, not only during URL validation. Security tests should enumerate every connector and transport, including redirects, mixed DNS answers and alternate client implementations.

## What defenders should verify now

Self-hosted operators should inventory running Budibase server versions and upgrade every instance below 3.40.0 to a current supported release. Verification must come from the deployed service or image, not just a developer lockfile. Managed-service customers should seek version or remediation confirmation from their provider.

After upgrading, rotate MongoDB credentials and Firebase service-account keys configured in affected instances when untrusted or broadly assigned application accounts could access datasource objects. Rotation should include revoking the old material and confirming that the replacement has only the database and cloud permissions the application actually needs. This is a precaution based on exposure potential, not evidence that anyone retrieved a credential.

Review roles that can read tables, manage datasources, import OpenAPI definitions or execute REST queries. Reduce builder access, and separate application users from connector administration. Check relevant API and audit logs for unusual datasource reads or unexpected outbound destinations, while treating anomalies as leads rather than proof of malicious activity.

## Make the platform only one layer

An independent network boundary limits the consequence of future connector mistakes. Restrict the Budibase runtime's outbound traffic to required destinations, keep local administrative services and cloud metadata endpoints outside its reachable network path, and isolate private management networks. Database accounts and service identities should likewise be scoped to the minimum operations and datasets each application needs.

The durable lesson is not simply to add two regression tests. Connector platforms need one enforceable definition of a secret and one enforceable outbound network policy, regardless of field type, database dialect or HTTP library. Version 3.40.0 closes the disclosed paths; architecture-level controls reduce the cost of the next inconsistency.
