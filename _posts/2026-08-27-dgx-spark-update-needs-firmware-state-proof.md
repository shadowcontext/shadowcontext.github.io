---
title: "DGX Spark Update Needs Firmware-State Proof"
subtitle: "Five firmware flaws make the installed UEFI version and completed reboot part of the remediation evidence."
description: "NVIDIA's DGX Spark update fixes five firmware flaws; defenders should verify version 1.110.13 on each running system after installation."
date: 2026-08-27 03:09:49 +0400
layout: post
category: defense
tags: [nvidia, firmware-security, vulnerability-management, ai-infrastructure]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-27-dgx-spark-update-needs-firmware-state-proof.svg
image_alt: "Abstract AI compute module with layered firmware blocks crossing a luminous verification ring into a protected running state"
key_points:
  - "NVIDIA lists five DGX Spark firmware and UEFI vulnerabilities affecting versions through 1.110.12."
  - "Version 1.110.13 is the corrected release identified for all five issues."
  - "Remediation evidence should connect the update job to the firmware version reported after reboot."
sources:
  - title: "Security Bulletin: NVIDIA DGX Spark - August 2026"
    publisher: "NVIDIA · August 25, 2026"
    url: "https://nvidia.custhelp.com/app/answers/detail/a_id/5867"
  - title: "NVIDIA security advisory (AV26-849)"
    publisher: "Canadian Centre for Cyber Security · August 26, 2026"
    url: "https://www.cyber.gc.ca/en/alerts-advisories/nvidia-security-advisory-av26-849"
---

NVIDIA has released DGX Spark UEFI version 1.110.13 to address five vulnerabilities in system firmware, standalone MM firmware and UEFI. A Canadian Centre for Cyber Security alert dated August 26 directs administrators to the vendor’s bulletin and identifies DGX Spark versions before 1.110.13 as affected.

The defensive task is narrower than the dramatic impact labels might suggest, but it is also easy to close incorrectly. These are firmware fixes. An update package on disk is not proof that a running system has crossed the security boundary; teams need the version reported by the machine after the prescribed update and restart process.

## What the bulletin establishes

NVIDIA’s bulletin lists CVE-2026-24262, CVE-2026-47626 and CVE-2026-24263 as high-severity issues with CVSS scores of 8.2. The first two are out-of-bounds writes in system firmware. The third is a null-pointer dereference in system firmware. NVIDIA says successful exploitation may lead to code execution, privilege escalation, denial of service, information disclosure or data tampering.

Two medium-severity issues complete the update. CVE-2026-24225 is an out-of-bounds read in standalone MM firmware that may disclose information. CVE-2026-47624 is a UEFI protection-mechanism failure that may allow a privileged local user to bypass UEFI administrator-password protection. NVIDIA scores both at 6.0.

The vendor maps all five CVEs to DGX Spark UEFI versions from 0 through 1.110.12 and identifies 1.110.13 as updated. It directs customers to its OS and Component Update Guide for the installation procedure. The bulletin does not say the flaws are being exploited, and neither source reports an organizational compromise.

## Why firmware evidence is different

Firmware sits below the operating system and many controls that defenders routinely query. A configuration-management console may confirm that an installer ran, while the host still reports an earlier firmware revision because activation requires a reboot, the update failed, or one system was absent during the maintenance window.

That gap matters in AI infrastructure. Teams may inventory a DGX Spark by workload, owner or cluster membership while a hardware-management process tracks serial numbers and firmware separately. If those records do not join cleanly, a successful campaign percentage can hide a missed physical system, a returned spare or a device restored from an older provisioning path.

The prerequisites also shape triage. NVIDIA’s vectors describe local access and high privileges for the five issues. That is not a reason to defer the update indefinitely. It is a reason to avoid describing the flaws as unauthenticated remote exposure and to pair firmware remediation with controls over local administration, maintenance access and physical custody.

## Build a verifiable update sequence

Start with a serial-number-level inventory of DGX Spark systems, including lab units, spares and devices temporarily offline. Record the firmware version each machine reports before the change, not merely the operating-system image or management-agent version. Map every asset to an owner and an approved maintenance window.

Follow NVIDIA’s update guidance and preserve the result of each update job. Plan for workload drainage and restart rather than allowing availability concerns to turn activation into an untracked follow-up. After the system returns, query the firmware or UEFI version again and require 1.110.13 as the completion condition. A machine that does not return the intended version should remain open for remediation even when its installer reported success.

Then validate normal boot, hardware health and the AI workload paths expected on that system. Check that monitoring and management agents reconnect, and reconcile the observed devices against the starting inventory. Exceptions should name the asset, reason, compensating control, owner and expiry date.

## Close on running state

The durable lesson is that firmware patching needs two linked records: delivery and activation. The first shows that the correct update was offered to the correct device. The second shows that the device is now running the corrected revision.

For this advisory, closure means every in-scope DGX Spark is accounted for and reports firmware version 1.110.13 after a controlled update. That modest evidence standard prevents a familiar failure: mistaking completed change activity for corrected machine state.
