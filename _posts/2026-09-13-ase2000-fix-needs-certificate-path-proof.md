---
title: "ASE2000 Fix Needs Certificate-Path Proof"
subtitle: "A corrected TLS check protects industrial test traffic only when every relevant workstation is found and upgraded."
description: "CVE-2026-90647 makes ASE2000 remediation an inventory and trust-path task for teams testing IEC 60870-5-104 communications."
date: 2026-09-13 15:09:50 +0400
layout: post
category: defense
tags: [industrial-security, scada, tls, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-13-ase2000-fix-needs-certificate-path-proof.svg
image_alt: "Abstract industrial communication pulses crossing a segmented network through a certificate-shaped shield that blocks a fractured false path"
key_points:
  - "CVE-2026-90647 affects ASE2000 versions 2.35 through 2.37 in IEC 60870-5-104 TLS client Task Mode."
  - "Certain combinations of certificate errors could be accepted instead of rejected."
  - "Operators should upgrade to 2.38 and verify every workstation and network path used for testing."
sources:
  - title: "Two Vulnerabilities in ASE2000 V2 Communication Test Set - Improper Certificate Validation (IEC 60870-5-104 TLS Client) and Bundled Third-Party Library (Apache log4net XXE)"
    publisher: "ASE/Kalkitech · July 20, 2026"
    url: "https://www.ase-systems.com/wp-content/uploads/2026/07/CYB_2026_86278_Advisory_v1.0.pdf"
  - title: "ASE/Kalkitech ASE2000 V2 Communication Test Set 2.35..."
    publisher: "GitHub Advisory Database · September 13, 2026"
    url: "https://github.com/advisories/GHSA-gcc5-22r7-2jf2"
  - title: "ASE2000 V2 RTU Test Set: The Universal Protocol Simulator & Analyzer"
    publisher: "ASE/Kalkitech · accessed September 13, 2026"
    url: "https://www.ase-systems.com/products/ase2000-v2/"
---

A newly catalogued vulnerability in an industrial communications test tool turns certificate validation into an asset-discovery problem. CVE-2026-90647 affects a specific ASE2000 client mode, but test workstations can move between labs, field networks and control environments. Defenders therefore need to find the complete operational footprint, not merely update the best-known installation.

ASE/Kalkitech says it has no information indicating exploitation in customer environments. This is a vulnerability advisory, not an incident report. The defensive priority comes from what the software is trusted to do: test and troubleshoot communications with SCADA remote terminal units and intelligent electronic devices.

## What the advisory establishes

The vendor says the certificate-validation flaw affects ASE2000 V2 Communication Test Set versions 2.35 through 2.37 on Windows. It is limited to the IEC 60870-5-104 TLS client in Task Mode. Version 2.38 corrects the validation logic.

When that client establishes an outbound TLS connection, its validation routine handles individual certificate errors correctly but can accept certain combinations of simultaneous errors. The vendor identifies a self-signed certificate with a mismatched host name as the most readily triggered case: the trust-chain and name errors occur together, yet the combination can be accepted.

A network-positioned attacker who can intercept the connection could consequently impersonate the intended peer, complete the TLS handshake, and read or modify traffic. The vendor scores the issue 7.4 under CVSS 3.1 and 9.1 under CVSS 4.0. Those numbers use different versions of the scoring system; they should not be presented as a change in the underlying defect.

## Why a test tool changes the risk model

ASE2000 is not described by its maker as an always-on control server. It is a protocol simulator and test set used to test, maintain and diagnose SCADA RTU and IED communications. Its product page says it supports IEC 60870-5-104 along with DNP3, Modbus and many other protocols, and can operate in field, control-centre or cloud settings.

That mobility is the important operational lesson. A conventional server inventory may miss engineering laptops, shared lab systems, vendor-managed workstations, recovery kits or virtual machines retained for occasional testing. A vulnerable copy that is powered off during a normal scan can reappear later on a more sensitive path.

The condition also depends on context. Exploitation requires a position between the client and intended peer, and only the named protocol, TLS client role and Task Mode are implicated by this CVE. Teams should use those boundaries to prioritize work, not to excuse unknown assets. Until the mode and route are verified, “not affected” remains an assumption.

## Upgrade, then prove the trust path

ASE/Kalkitech advises upgrading to version 2.38. Begin by asking SCADA engineering, commissioning, maintenance and third-party support teams where ASE2000 is installed or preserved. Record the running version, host owner, operating location, enabled protocol and mode, intended peers, and whether the host crosses shared or untrusted networks.

Apply the vendor-provided update through the organization’s controlled software process. Then launch the installed application and record evidence that it reports 2.38 or later. Check dormant virtual-machine images, loan equipment and recovery media separately; updating one golden image does not prove that already-deployed copies changed.

Validation should include a safe negative test in an isolated lab: confirm that the corrected client refuses an untrusted certificate and a certificate whose identity does not match the intended peer. The objective is to verify failure behavior without interacting with production control equipment.

## Contain exposure while change is pending

Where an immediate upgrade is not possible, the vendor recommends avoiding IEC 60870-5-104 over TLS across untrusted or shared networks, placing ASE2000 hosts on isolated segments reachable only by intended peers, and protecting the host with a firewall. These are interim controls, not substitutes for corrected certificate handling.

Restrict routes and permitted peers according to documented test needs, and time-limit any exception. Close the remediation ticket only when the inventory, installed version, network policy and negative trust test agree. For portable industrial tooling, that evidence is what turns a downloaded fix into a restored security boundary.
