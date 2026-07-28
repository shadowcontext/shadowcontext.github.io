---
title: "Erlang Fix Restores Certificate Checks Before TLS 1.3"
subtitle: "A runtime update repairs a client-side negotiation flaw that could defeat server identity checks on older TLS paths."
description: "Erlang/OTP 29.0.4 fixes a pre-TLS 1.3 certificate-validation bypass and certificate-chain denial-of-service weaknesses."
date: 2026-07-28 06:10:25 +0400
layout: post
category: defense
tags: [erlang, tls-security, vulnerability-management, certificate-validation]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-07-28-erlang-fix-restores-pre-tls13-certificate-checks.svg
image_alt: "Abstract encrypted connection passing through a luminous certificate shield while a fractured legacy path is contained below"
key_points:
  - "Erlang/OTP 29.0.4 restores a missing negotiation check for TLS 1.2 and earlier clients."
  - "The release also limits certificate-chain paths that could exhaust memory or cycle during validation."
  - "Defenders should find embedded runtimes, update the complete dependency set, and verify live versions."
sources:
  - title: "Release OTP 29.0.4 · erlang/otp · GitHub"
    publisher: "Erlang/OTP · July 27, 2026"
    url: "https://github.com/erlang/otp/releases/tag/OTP-29.0.4"
  - title: "SSL Release Notes — OTP 29.0.4 (ssl 11.7.4)"
    publisher: "Erlang/OTP · July 27, 2026"
    url: "https://www.erlang.org/doc/apps/ssl/notes.html"
---

Erlang/OTP 29.0.4 closes a serious gap in how clients using TLS 1.2 or earlier validate a server’s choice of cryptographic algorithm. The July 27 patch also hardens certificate-chain processing against denial of service. For defenders, this is a runtime-level update: finding the application is only the first step; proving which OTP and SSL components it actually loads is the control that matters.

## The missing check undermined identity

The Erlang/OTP project says CVE-2026-55953 concerns client-side negotiation before TLS 1.3. A server’s selected algorithm was not checked against the algorithms the client had offered. In the worst case, the project says, an on-path adversary could circumvent validation of the server certificate and cause the client to trust the adversary as though it were the intended server.

That distinction is important. Encryption is not sufficient if the client has not reliably established who is at the other end of the connection. Certificate verification, hostname checking, trusted certificate authorities and cipher negotiation form one decision chain. A missing constraint in that chain can invalidate the assurance that the surrounding configuration appears to provide.

The project notes that TLS 1.3 clients already performed the check. That narrows the affected protocol path, but it does not make the update optional. Applications may retain older protocol support for interoperability, connect to services through compatibility settings, or run with a library configuration that differs from an organization’s intended standard. The release notes do not state that the flaw is being exploited, so urgency should come from exposure and consequence rather than an unsupported claim of active attacks.

## Certificate processing also needed limits

The same SSL 11.7.4 release repairs two availability weaknesses in certificate handling. One fix prevents invalid certificate chains from creating cycles while the library reconstructs chains that are unordered or contain extra certificates. Another places a node-count limit on certificate policy-tree processing after the project found that crafted policy mappings could drive exponential memory consumption during a TLS handshake.

These fixes reinforce a broader rule: authentication inputs need resource boundaries as well as correctness checks. A certificate chain is security metadata, but it is still untrusted input until validation completes. Parsing, ordering and policy evaluation all consume memory and processor time before the peer has earned trust.

TLS 1.3 preference alone therefore does not address the whole release. It reduces dependence on the negotiation path described in CVE-2026-55953, but certificate-path validation remains relevant to authenticated connections. The durable response is to deploy corrected components and keep protocol policy as an additional layer.

## Inventory the runtime, not just the service

The patch package updates OTP 29 to 29.0.4 and includes SSL 11.7.4, public_key 1.21.4 and other corrected applications. The project explicitly notes that SSL 11.7.4 cannot be applied independently to an arbitrary OTP 29 installation because its runtime dependencies must also be satisfied. That makes selective file replacement a poor operational shortcut.

Teams should identify production software that embeds or packages the Erlang runtime, then record the live OTP release and component versions for each deployment. Source manifests, container definitions and software-composition inventories can guide discovery, but they are not final evidence: a rebuilt image, vendor appliance or long-running node may not match the repository that describes it.

Prioritize systems that initiate TLS connections across untrusted or shared networks, accept peer certificate chains, or process externally supplied Erlang terms. Coordinate with application or appliance vendors where the runtime is bundled and not meant to be updated independently. Unsupported release lines should enter an upgrade path rather than receive an improvised component mix.

## Close with connection and version evidence

After updating, verify the running OTP release and loaded library versions on every node, including replicas, workers and replacement images used for scaling. Exercise representative outbound and mutual-TLS connections in a controlled test so that a security rollout does not silently break a required compatibility path. Confirm that monitoring still captures handshake failures and unexpected fallback to older protocols.

Configuration review remains useful. Remove obsolete protocol support where business dependencies permit, require peer verification where the application expects authenticated TLS, and ensure trust stores are managed rather than inherited without ownership. Those measures reduce exposure, but none should be recorded as a substitute for the corrected runtime.

The central lesson from OTP 29.0.4 is that transport security depends on the entire validation state machine. Defenders need proof that negotiation choices are constrained, certificate processing is bounded and the fixed code is the code actually running.
