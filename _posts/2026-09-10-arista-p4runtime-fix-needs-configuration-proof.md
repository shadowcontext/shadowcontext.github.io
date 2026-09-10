---
title: "Arista P4Runtime Fix Needs Configuration-Level Proof"
subtitle: "A critical EOS flaw shows why feature state and trust configuration must accompany version evidence."
description: "CVE-2026-73453 affects certain Arista EOS systems with P4Runtime enabled, making configuration evidence central to safe remediation."
date: 2026-09-10 07:12:34 +0400
layout: post
category: defense
tags: [network-security, vulnerability-management, control-plane, zero-trust]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-10-arista-p4runtime-fix-needs-configuration-proof.svg
image_alt: "Abstract network switch lanes feeding a programmable control core through a layered teal authentication barrier"
key_points:
  - "CVE-2026-73453 affects listed Arista EOS releases only when P4Runtime is explicitly enabled in specified configurations."
  - "Arista recommends fixed EOS releases and provides no hotfix for the vulnerability."
  - "Defenders should verify feature state, transport trust and authorization before and after the upgrade."
sources:
  - title: "Security Advisory 0174"
    publisher: "Arista Networks · September 9, 2026"
    url: "https://www.arista.com/en/support/advisories-notices/security-advisory/24730-security-advisory-0174"
---

Arista Networks has disclosed a critical code-injection vulnerability in the P4Runtime service on affected EOS platforms. The issue is serious, but it is not a blanket statement about every Arista switch: exposure depends on both the running software and a feature that is disabled by default.

That distinction gives defenders a precise task. Establish where P4Runtime is enabled, determine how each instance authenticates and authorizes clients, then move exposed systems to a fixed release without treating a version-only inventory as proof of safety.

## What the advisory confirms

Arista's [Security Advisory 0174](https://www.arista.com/en/support/advisories-notices/security-advisory/24730-security-advisory-0174) assigns CVE-2026-73453 a CVSS 3.1 base score of 10.0 and a CVSS 4.0 base score of 9.5. The vendor says an unauthenticated P4Runtime client can, under certain conditions, execute arbitrary code and obtain complete administrative control of an affected switch.

The vulnerable surface is narrower than the scores alone suggest. P4Runtime must be explicitly enabled, and Arista identifies three exposed arrangements: operation without TLS; TLS without trusted certificates; or an mTLS deployment where accounting is enabled while gNSI authorization is disabled. A device with P4Runtime disabled is not exposed to this issue, according to the advisory.

Affected software spans specified releases in EOS trains from 4.29.x through 4.36.x, subject to the detailed version boundaries in the vendor table. The platform list includes physical EOS switches as well as CloudEOS and lab variants. Arista says it discovered the flaw internally and is not aware of malicious exploitation in customer networks. It also says there are no specific indicators of compromise.

## Configuration is part of vulnerability state

An asset record containing only vendor, model and EOS version cannot answer whether this vulnerability is reachable. Teams need a fourth dimension: the live service configuration. Start with the vendor's documented status checks, collected through approved administrative channels, and record whether P4Runtime is enabled for every in-scope device.

For enabled instances, document the transport and identity controls without copying private keys, certificate material or authorization policy contents into tickets. The useful evidence is whether TLS is configured, whether a trusted client-certificate chain is present, whether accounting is active and whether gNSI authorization is enabled. Link that evidence to the device identity and collection time so reviewers can distinguish current state from an old configuration export.

This approach also prevents an easy reporting error. A non-affected software release and a disabled service are separate reasons for non-exposure; neither should be inferred from the other. Likewise, a device absent from a central dashboard is not automatically safe. Arista notes that on-premises CloudVision deployments need additional telemetry for its detection rule to identify affected systems, so teams should validate dashboard coverage before relying on it.

## Fix the code and strengthen the trust path

Arista's recommended resolution is to upgrade. The vendor lists fixes in EOS 4.36.2F, 4.35.6M and 4.34.8M or later releases within those trains, and advises customers to move to the latest release containing the applicable fixes. Earlier trains listed as affected need a supported upgrade destination. There is no hotfix for CVE-2026-73453.

The advisory also describes a mitigation based on mTLS with trusted client certificates plus gNSI authorization tied to the client's SPIFFE identity. That is valuable hardening because it joins transport authentication to per-client authorization. It is not a substitute for corrected software, and it carries an operational consequence: enabling mTLS terminates existing P4 client connections and may disrupt control-plane packet operations.

Plan that change as a coordinated control-plane maintenance event. Identify the applications that program the switch, verify their certificate identities and authorization policies, define rollback conditions, and preserve an out-of-band administration path. If P4Runtime is not required, disabling the feature removes the vulnerable service path while the permanent upgrade is scheduled.

## Close with runtime evidence

After the change, verify the running EOS build on the device rather than trusting the package repository or completed deployment job. Recheck P4Runtime state and, where the service remains enabled, confirm that trusted certificates and authorization are active. Test approved client connectivity and expected network behavior; a secure configuration that silently breaks legitimate programming workflows is not a stable end state.

Finally, reconcile the verified device list with CloudVision and the configuration-management inventory. Exceptions should name an owner, exposure controls and a deadline. Closure means every affected device is either on a vendor-fixed release or demonstrably outside the vulnerable configuration while awaiting it—and that the evidence remains attached to the asset, not buried in a one-time patch report.
