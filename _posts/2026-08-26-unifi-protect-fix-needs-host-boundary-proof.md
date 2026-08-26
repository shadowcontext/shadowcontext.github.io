---
title: "UniFi Protect Fix Closes Two Command-Injection Paths"
subtitle: "The critical flaws turn application reach into host risk, making deployed-version and network-path verification essential."
description: "Two critical UniFi Protect flaws can cross from the application into its host; defenders should verify version 7.2.105 and restrict reachability."
date: 2026-08-26 19:08:58 +0400
layout: post
category: defense
tags: [vulnerability-management, network-security, video-security, patching]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-26-unifi-protect-fix-needs-host-boundary-proof.svg
image_alt: "Abstract camera aperture enclosed by layered teal shields while an amber update path seals two breaks in the host boundary"
key_points:
  - "Two critical flaws let network-reachable actors cross from UniFi Protect into its host."
  - "CVE-2026-77537 requires no privileges; CVE-2026-77548 requires low privileges."
  - "Defenders should update to 7.2.105 or later and verify the running application on every console."
sources:
  - title: "Security Advisory Bulletin 067"
    publisher: "Ubiquiti · August 26, 2026"
    url: "https://community.ui.com/releases/Security-Advisory-Bulletin-067/fc4a3488-7c43-4628-8bab-f715e96dbfc9"
  - title: "CVE-2026-77537"
    publisher: "CVE Program · August 26, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/77xxx/CVE-2026-77537.json"
  - title: "CVE-2026-77548"
    publisher: "CVE Program · August 26, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/77xxx/CVE-2026-77548.json"
  - title: "UniFi Protect Application 7.2.105"
    publisher: "Ubiquiti · August 12, 2026"
    url: "https://community.ui.com/releases/UniFi-Protect-Application-7-2-105/4fa06975-6aa3-4e3f-b7d5-8814e331d14c"
---

A video-security application should not let an application request become authority over its host. Two newly published critical vulnerabilities in UniFi Protect cross that boundary, giving defenders a concrete reason to verify both the software actually running and the network paths that can reach it.

## What the advisory establishes

Ubiquiti's August 26 Security Advisory Bulletin 067 identifies two improper-input-validation flaws in the UniFi Protect Application. CVE-2026-77537 can be reached by a malicious actor with network access and no privileges; CVE-2026-77548 requires network access and low privileges. In both cases, Ubiquiti says successful exploitation could produce command injection on the host device.

The vendor assigns CVE-2026-77537 a 10.0 CVSS score and CVE-2026-77548 a 9.9 score. Its mitigation for both is to update UniFi Protect to version 7.2.105 or later. The CVE records independently preserve the same fixed-version boundary: versions below 7.2.105 are affected.

Those facts justify urgent remediation, but not unsupported incident claims. The advisory and CVE records describe vulnerability conditions and impact; they do not establish that a particular deployment was compromised. Defenders should keep the response centered on exposure, version state and containment.

## Why the host boundary matters

Protect is not merely a viewing client. It operates around cameras, recordings, cases and administrative workflows. A command-injection path that reaches the underlying host therefore changes the risk calculation: an application-facing route can become operating-system authority, subject to the privileges and isolation of the service environment.

The no-privilege condition for CVE-2026-77537 makes network reachability especially important. "Network access" does not by itself mean internet exposure, and the vendor does not say that every installation is publicly reachable. It does mean teams should identify which management interfaces are reachable from user, guest, camera, vendor-support and remote-access networks instead of treating an internal address as sufficient protection.

CVE-2026-77548 adds a separate lesson. A low-privilege account is still a security boundary. If an ordinary application identity can trigger host commands, role design inside the application cannot contain the consequence. Updating closes the documented flaw; restricting access and minimizing host privilege reduce the effect of future failures at the same boundary.

## Verify the deployed fix

Start with an inventory of every console running Protect, including standby units, lab systems and appliances held for restoration. Record the observed application version and its source. The target is 7.2.105 or later, not merely an approved change ticket or a downloaded package.

After updating through the supported channel, confirm the console reports the expected running version and remains healthy after any required restart. Check centrally managed sites individually: a successful rollout percentage can conceal an offline appliance, a failed update or a unit outside the management group. Preserve that evidence with the asset record so vulnerability closure is auditable.

Then review reachability. Limit the management plane to authorized administration paths, remove unnecessary exposure, and separate camera or device networks from general user access where the architecture permits. Review low-privilege accounts and integrations, disabling identities that are stale or unnecessary. These steps are compensating controls, not substitutes for 7.2.105.

## Turn patching into boundary assurance

Closure should answer three questions: Is every relevant instance on a fixed release? Can only intended networks and identities reach its administrative surface? Is the application host constrained from systems and credentials it does not need?

Monitor update failures, unexpected configuration changes and unusual child-process or outbound-network behavior using the telemetry available in the environment. Such signals are useful for validation and investigation, but their absence does not prove safety. The strongest evidence is a joined record of deployed version, controlled reachability and least-privilege hosting.

The immediate task is clear: move UniFi Protect below 7.2.105 across the fixed-version boundary. The durable lesson is broader. When a security application can cross into its host, defenders must verify the patch at runtime and reinforce the boundary around the service.
