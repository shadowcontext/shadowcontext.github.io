---
title: "HAProxy HTTP/3 Flaw Needs Protocol-Path Proof"
subtitle: "A new request-smuggling flaw exists only across a specific frontend, backend and connection-reuse chain."
description: "CVE-2026-90678 makes HAProxy remediation a protocol-path task: verify QUIC listeners, HTTP/1.1 backends and connection reuse together."
date: 2026-09-13 14:10:17 +0400
layout: post
category: defense
tags: [haproxy, http3, request-smuggling, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-13-haproxy-http3-fix-needs-protocol-path-proof.svg
image_alt: "Abstract teal and amber protocol streams crossing a proxy boundary, with one incomplete frame stopped before a shared backend channel"
key_points:
  - "CVE-2026-90678 affects HAProxy 3.3.0 through 3.4.4 under a specific HTTP/3-to-HTTP/1.1 configuration."
  - "The risk depends on a QUIC frontend, chunked HTTP/1.1 backend traffic and reuse of the backend connection."
  - "Operators should reduce the exposed protocol path and verify a supported fixed build before restoring it."
sources:
  - title: "An issue was discovered in HAProxy 3.3.0 through 3.4.4..."
    publisher: "GitHub Advisory Database · September 13, 2026"
    url: "https://github.com/advisories/GHSA-9f9v-4h96-wh6m"
  - title: "BUG/MAJOR: h3: reject H3 truncated frames"
    publisher: "HAProxy project · September 3, 2026"
    url: "https://github.com/haproxy/haproxy/commit/86a4ebc761a278838e8cb06f3a292282ba704c65"
  - title: "HAProxy 3.4 ChangeLog"
    publisher: "HAProxy project · accessed September 13, 2026"
    url: "https://www.haproxy.org/download/3.4/src/CHANGELOG"
---

A high-severity HAProxy vulnerability published today shows why proxy security cannot be reduced to a version number. CVE-2026-90678 crosses three boundaries at once: HTTP/3 at the public edge, HTTP/1.1 toward the application, and a backend connection returned to a shared pool. Defenders need to establish whether that complete path exists before choosing the safest immediate response.

The disclosure is not a breach report and does not claim exploitation. It describes a remotely reachable request-smuggling condition with demanding prerequisites, plus an upstream correction that has not yet appeared in the latest public 3.4 stable release listed by the project.

## What the new advisory confirms

The GitHub Advisory Database rates CVE-2026-90678 High at 7.5. It lists HAProxy 3.3.0 through 3.4.4 and development releases 3.5-dev1 through 3.5-dev5 as affected. HAProxy 3.2 and earlier are described as unaffected because the faulty behavior was introduced during development of 3.3.

Exposure requires HAProxy to be built with QUIC support and configured with an HTTP/3 frontend. The affected request must then travel to a backend over HTTP/1.1 using chunked transfer coding, and the backend connection must be reused. Those conditions matter: an installed version inside the range is a reason to investigate, but it does not by itself prove that a deployment exposes the vulnerable route.

According to the advisory, HAProxy can accept a declared HTTP/3 DATA-frame length before all of that frame's payload has arrived. If the client ends the stream early, the proxy may emit an oversized HTTP/1.1 chunk and return the backend connection to its pool in a desynchronized state. A later request can then be interpreted in the wrong message context. The advisory says this can bypass a frontend path-deny rule or cause another client's request data to be consumed and lost.

## The fix closes an incomplete-frame boundary

HAProxy's upstream commit treats a stream ending with an incomplete HTTP/3 frame as a protocol error and closes the connection. The commit notes that this behavior is required when a frame is truncated and identifies prevention of request-content smuggling as the security objective. In defensive terms, the proxy must not translate a promised length into another protocol until it knows the promised bytes exist.

Release state needs careful wording. The public HAProxy 3.4 changelog still begins with version 3.4.4, released August 27, while the corrective commit was made on September 3. The newly published CVE explicitly includes 3.4.4. Operators should therefore not describe a 3.4.4 deployment as remediated merely because the fix is visible upstream, and they should not build an ad hoc production binary without their normal packaging, provenance and support controls.

## Reduce the path while a supported update lands

Start with runtime evidence. Record the version reported by every HAProxy process, whether the binary contains QUIC support, and which bind lines expose HTTP/3. Trace those frontends to their backend protocol, then determine whether HTTP/1.1 chunked requests and connection reuse can occur on that route. Include standby nodes, canaries and rollback images; uneven fleets preserve the path.

Where an affected route exists, obtain the correction through the organization's supported package or appliance channel as soon as a fixed build is available. Confirm with the supplier which build contains the upstream change. Until then, a proportionate temporary control is to remove at least one required condition—for example, disable HTTP/3 on the affected listener and serve clients over a separately tested supported protocol. Any change should be staged, monitored and reversible because edge-protocol changes can alter performance and client behavior.

Do not rely on a web-application firewall signature as the primary answer. The defect concerns how two protocol parsers and a pooled connection share message boundaries; pattern matching does not prove that those boundaries remain synchronized.

## Close with end-to-end proof

After deploying a supported corrected build, verify the running binary on every node rather than only the intended package state. Recheck that traffic actually reaches the updated pool, exercise normal HTTP/3 requests through representative HTTP/1.1 backends, and confirm that deliberately incomplete frames are rejected in a controlled test environment without affecting later requests on shared connections.

Retain a concise evidence set: binary version or package build, supplier confirmation that the fix is included, QUIC listener inventory, backend protocol mapping, connection-reuse policy and regression results. The durable lesson is architectural: when a proxy translates protocols, message completeness must be established before pooled state is reused. Patch proof and path proof belong in the same change record.
