---
title: "Network Access Revocation Needs Session-Level Proof"
subtitle: "A newly published Arista EOS CVE shows why a disconnect command is not evidence that network access actually ended."
description: "CVE-2026-73449 can leave some Arista EOS 802.1X sessions authorized, making revocation testing and configuration-aware patching essential."
date: 2026-09-15 15:11:02 +0400
layout: post
category: defense
tags: [network-access-control, 802.1x, radius, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-15-network-access-revocation-needs-session-proof.svg
image_alt: "Abstract network access field with a fading authorization path interrupted by a luminous revocation barrier and isolated endpoint nodes"
key_points:
  - "CVE-2026-73449 affects a specific combination of 802.1X and RADIUS proxy dynamic authorization."
  - "A disconnect decision may fail to remove an already authorized endpoint session."
  - "Defenders should patch affected EOS releases and verify revocation at the switch and endpoint."
sources:
  - title: "CVE-2026-73449"
    publisher: "CVE Program · September 14, 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-73449"
  - title: "Security Advisory 0149"
    publisher: "Arista Networks · September 9, 2026"
    url: "https://www.arista.com/en/support/advisories-notices/security-advisory/24705-security-advisory-0149"
---

A newly published CVE for Arista EOS turns a narrow switch configuration into a useful test of network-access control: when a policy engine says an endpoint must disconnect, can defenders prove that the active session actually lost access?

CVE-2026-73449 does not describe a breach, and Arista says it is not aware of malicious exploitation in customer networks. It does describe a gap between a central revocation decision and enforcement on the switch. That gap deserves attention because authentication is only half of access control; termination must work just as reliably.

## What the vulnerability changes

The CVE Program published CVE-2026-73449 on 14 September. Arista's underlying advisory says affected EOS deployments can fail to apply RADIUS dynamic-authorization messages to locally authenticated 802.1X sessions. Those messages include Change-of-Authorization and Disconnect-Requests, which a RADIUS server or network-access-control system uses to alter or end access after initial authentication.

The result is specific but consequential: an endpoint session that the central system ordered disconnected may remain authorized on the network. Arista rates the vulnerability 5.9 under both CVSS 3.1 and CVSS 4.0. The company says exploitation requires a low-privileged actor on an adjacent network segment who can induce a RADIUS packet through a configured proxy client.

Exposure also requires two features to be enabled together: 802.1X port authentication with dynamic authorization, and the RADIUS proxy feature with dynamic authorization. Deployments without that combination are not within the advisory's stated vulnerable configuration. That makes configuration evidence, rather than a vendor name in an asset inventory, the correct starting point.

Arista lists EOS 4.36.1F and earlier in the 4.36 train, 4.35.5M and earlier in the 4.35 train, and 4.34.7.1M and earlier in the 4.34 train as affected. It identifies 4.36.2F, 4.35.6M and 4.34.8M as remediated releases.

## Treat revocation as an end-to-end control

Access-control assurance often concentrates on admission: whether an endpoint presents the right identity, satisfies posture checks and reaches the intended segment. CVE-2026-73449 highlights the reverse path. A policy engine can make the right decision while the enforcement point preserves the wrong state.

Defenders should map that path explicitly. Record which RADIUS or NAC service originates a change or disconnect, which proxy forwards it, which switch owns the local 802.1X session, and which telemetry confirms the endpoint's final state. A successful request at the policy server is not sufficient closure if the switch did not match or remove the session.

The advisory identifies useful failure evidence without claiming it will appear in every environment. Authentication-server logs may show Change-of-Authorization or Disconnect negative acknowledgements, particularly a “Session Context Not Found” condition, missing responses, or anomalous dynamic-authorization counters. Logging formats vary, so teams should translate those conditions into their own platform's fields and alerts rather than depend on a single message string.

This same reasoning applies to ordinary operations. Device quarantine, employee departure, certificate revocation and posture failure all rely on an authorization decision reaching the active session. Each workflow needs a measurable terminal state: the endpoint is disconnected, moved to the intended restricted policy, or otherwise denied the access that was withdrawn.

## Patch, then test the outcome

Inventory EOS switches by running release and enabled configuration. Prioritize devices where both prerequisite features are present, then move affected systems to the appropriate fixed release using Arista's advisory and normal change controls. Confirm the running version on every member after maintenance; a completed deployment job does not prove that every switch or redundant control-plane member is serving fixed software.

Arista says disabling RADIUS proxy dynamic authorization removes this exposure when that function is not operationally required, while noting that doing so stops the switch from forwarding dynamic-authorization requests to downstream proxy clients. The vendor also describes lowering the proxy client session idle timeout as a way to reduce, but not eliminate, the exposure window. Those are topology-dependent choices, not universal substitutes for the fixed software.

After remediation, run a safe test with a designated endpoint. Authenticate it through the same production-like policy path, issue a controlled disconnect or policy change, and observe the decision at the RADIUS service, proxy, switch session table and endpoint. Verify that access changes within the expected interval and that reconnect behavior still follows policy.

Preserve the result as control evidence: switch identity, EOS version, relevant feature state, test session, requested action, acknowledgements and final network state. CVE-2026-73449 is narrowly configured, but its lesson is broad. Revocation is credible only when defenders can prove that the enforcement point changed the live session.
