---
title: "SAP OVERPASS Fix Needs Kernel-Wide Proof"
subtitle: "A critical flaw in shared Extended Passport processing crosses web, GUI, and system-integration boundaries."
description: "CVE-2026-44756 puts shared SAP kernel code at risk across several protocols, making complete inventory and runtime patch proof urgent."
date: 2026-09-08 21:12:00 +0400
layout: post
category: defense
tags: [sap-security, vulnerability-management, kernel-security, enterprise-security]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-08-sap-overpass-fix-needs-kernel-wide-proof.svg
image_alt: "Abstract editorial image of three luminous data paths converging on a protected central kernel surrounded by layered containment rings"
key_points:
  - "CVE-2026-44756 affects shared Extended Passport processing and carries a CVSS 3.1 score of 10.0."
  - "The same kernel flaw is reachable through web, SAP GUI, and RFC communication paths."
  - "Only the vendor correction closes every path; network restrictions are temporary risk reduction."
sources:
  - title: "Memory Corruption vulnerability in SAP Extended Passport (EPP) Processing"
    publisher: "CVE Program · SAP · September 8, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/44xxx/CVE-2026-44756.json"
  - title: "Mitigating OVERPASS (CVE-2026-44756): A Critical Vulnerability in the SAP Kernel"
    publisher: "Onapsis Research Labs · September 8, 2026"
    url: "https://onapsis.com/blog/sap-overpass-remediation/"
---

SAP has published CVE-2026-44756 for a critical memory-safety flaw in the shared code that processes Extended Passports, a tracing structure carried between SAP components. The issue is important not only because SAP scores it 10.0, but because one vulnerable kernel path can be reached through several different communication layers.

The reporting researchers call the flaw OVERPASS. Their central defensive message is clear: identifying one exposed service is not enough, and closing one network route does not repair the underlying code.

## What the primary record establishes

SAP's CVE record describes a memory-safety vulnerability in the Extended Passport Protocol processing library. Under specific conditions, an unauthenticated attacker could send a malformed EPP header in a crafted network request, potentially causing undefined behaviour and abnormal termination. SAP assesses high potential impact to confidentiality, integrity and availability, with a CVSS 3.1 base score of 10.0.

The affected list spans multiple kernel and Web Dispatcher lines, including listed releases in the 7.22, 7.53, 7.54, 7.77, 7.89, 7.93, 8.04, 9.16, 9.18, 9.19 and 9.20 families. That list is not a substitute for SAP Security Note 3747649: authorized administrators should compare each installed kernel release and patch level with the current note rather than infer a safe build from a neighbouring branch.

Onapsis Research Labs says it discovered and responsibly disclosed the flaw. As of its September 8 publication, the team said it had not observed active exploitation in the wild. That statement should remain attached to its time and source; it does not reduce the urgency of correcting an unauthenticated, network-reachable defect.

## One flaw crosses several access paths

Onapsis explains that EPP processing is shared kernel code used at the start of a connection. The researchers confirmed reachability through three distinct layers: HTTP or HTTPS traffic handled by the Internet Communication Manager or Web Dispatcher, SAP GUI connections accepted by the Dispatcher, and Remote Function Call connections between SAP systems and integrations.

This changes how exposure should be mapped. An inventory limited to public web interfaces may miss internal GUI or RFC reachability. Conversely, removing a public route does not establish that the same kernel code is unreachable elsewhere. Teams should map systems by running kernel and patch level first, then add protocol exposure and business criticality to determine rollout order.

Start with Internet-facing systems, but include application servers, integration tiers, non-production copies, standby nodes and older systems that remain powered on. Record which networks can reach each communication layer and which connected services depend on it. The result should be a kernel-centred inventory, not three unrelated protocol lists.

## Patch first, constrain reachability while work proceeds

Onapsis says SAP Security Note 3747649 provides the definitive correction and that one kernel patch closes the confirmed paths. Apply the supported correction under emergency change procedures, beginning with publicly reachable systems and continuing through internal and recovery environments. Because the public CVE record does not enumerate fixed patch levels, do not turn its affected-family list into an improvised upgrade target.

Where immediate maintenance is impossible, reduce unnecessary access using the architecture's documented controls. Restrict web, GUI and RFC reachability to the smallest approved populations, preserve required integrations, and monitor the SAP application layer during the rollout. These measures lower exposure; they do not replace the patch. Onapsis specifically warns that ordinary SAP user authorizations do not address a flaw reached before authentication.

Avoid broad emergency blocks without dependency testing. A control that interrupts payroll, finance or integration traffic while leaving another path open produces disruption without complete protection. Each temporary restriction needs an owner, a tested service path and an expiry tied to patch completion.

## Close on running evidence, not change tickets

After maintenance, verify the active kernel release and patch level on every serving node through a trusted administrative method. Confirm that clustered members, Web Dispatchers, application servers, integration endpoints, standby systems and deployment templates all received the intended correction. Then test representative web, GUI and RFC workflows so operational success and security closure are demonstrated together.

Retain the SAP note revision, package identity, installation time, runtime evidence and validation result for each instance. Recheck after failover or restoration, when an older image can quietly return to service. CVE-2026-44756 is ultimately an inventory test: when vulnerable logic is shared beneath several interfaces, remediation is complete only when every route reaches corrected code.
