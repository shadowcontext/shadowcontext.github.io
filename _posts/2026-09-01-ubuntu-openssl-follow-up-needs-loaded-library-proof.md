---
title: "Ubuntu OpenSSL Follow-Up Needs Loaded-Library Proof"
subtitle: "An omitted fix in Ubuntu 26.04 LTS shows why package deployment and reboot evidence must close the same loop."
description: "Ubuntu’s OpenSSL follow-up fixes an omission on 26.04 LTS; defenders should verify package 3.5.5-1ubuntu3.5 and complete the reboot."
date: 2026-09-01 21:14:34 +0400
layout: post
category: defense
tags: [ubuntu, openssl, patch-management, cryptography]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-01-ubuntu-openssl-follow-up-needs-loaded-library-proof.svg
image_alt: "Abstract cryptographic ring repaired by a second update layer, with a restart pulse flowing through protected server nodes"
key_points:
  - "Ubuntu says its first OpenSSL update omitted the CVE-2026-75803 fix on 26.04 LTS."
  - "The corrected OpenSSL and libssl3t64 package version is 3.5.5-1ubuntu3.5."
  - "A reboot is required, so package state alone does not prove remediation."
sources:
  - title: "USN-8678-3: OpenSSL vulnerability"
    publisher: "Ubuntu · August 31, 2026"
    url: "https://ubuntu.com/security/notices/USN-8678-3"
  - title: "CVE-2026-75803"
    publisher: "Ubuntu · updated August 31, 2026"
    url: "https://ubuntu.com/security/CVE-2026-75803"
---

Ubuntu has published a follow-up OpenSSL update for Ubuntu 26.04 LTS after the earlier package omitted the fix for CVE-2026-75803. The correction is narrow, but the operational lesson is broad: an update job can complete successfully while the intended security property remains absent. Closure must join the corrected package version with proof that workloads have loaded it.

## What the follow-up establishes

Ubuntu Security Notice USN-8678-3, published August 31, says the previous OpenSSL update inadvertently left out the CVE-2026-75803 fix on Ubuntu 26.04 LTS. The replacement corrects that omission in both `openssl` and `libssl3t64` version `3.5.5-1ubuntu3.5`. Ubuntu instructs administrators to perform a standard system update and reboot the computer.

The CVE concerns authentication-tag verification when certain authenticated-encryption ciphers are used through the `EVP_Cipher()` interface. Ubuntu describes the potential outcome as an AEAD forgery under the affected conditions. Both Ubuntu and the OpenSSL developers rate the issue low severity; the Ubuntu CVE page shows the corrected package for 26.04 LTS and separately records fixed versions for 24.04 LTS and 22.04 LTS.

That severity should shape prioritization without obscuring the corrective action. The notice does not report active exploitation or observed impact. The confirmed development is that one Ubuntu release needed a second package because the intended fix was not actually included in the first.

## Advisory status is not system state

The earlier update created a potentially misleading signal. A fleet could show the original OpenSSL advisory as remediated, with successful automation records and no outstanding package transaction, yet still lack this specific correction on Ubuntu 26.04 LTS. Reopening the finding should therefore depend on observed release and package state rather than whether the first maintenance task was marked complete.

Start by separating Ubuntu 26.04 LTS systems from other releases. On that population, query the installed versions of both `openssl` and `libssl3t64` and compare the full epoch and revision with `3.5.5-1ubuntu3.5`. Do not reduce the result to the upstream OpenSSL version: `3.5.5` alone cannot distinguish the package that omitted the fix from the corrected Ubuntu build.

The same precision belongs in container and image workflows. Teams should identify 26.04-based images, rebuild them from refreshed repositories, and confirm the resolved package in the resulting artifact. A rebuilt tag with unchanged contents is not evidence of remediation. Record the image digest and package result that demonstrate the corrected input reached the deployable artifact.

## Reboot is part of the fix

OpenSSL is a shared security dependency used by long-running processes. Updating files on disk does not by itself prove those processes are using the new library. Ubuntu’s explicit reboot instruction supplies the safe completion boundary for this notice.

Plan the restart as part of the security change, not as optional housekeeping. For redundant services, rotate nodes through the update and reboot while monitoring capacity and health. For individual systems, schedule the required interruption, verify the host returned, and check that expected services recovered. Containerized workloads should be recreated from corrected images rather than merely restarted against an old filesystem layer.

Post-change evidence should capture the running kernel boot time, the corrected package versions, service health, and any application-specific TLS checks already used by the organization. The goal is not to invent a test for the low-level cryptographic flaw. It is to show that the vendor-supplied correction is installed and that no pre-update process remains in service.

## Make corrective advisories reopen work automatically

Follow-up notices should be a distinct event in vulnerability operations. When a vendor says a fix was incomplete or omitted, automation should reopen the earlier record, preserve its history, and create a new required baseline. This avoids counting the same host as safely remediated under two incompatible package states.

The closeout record for USN-8678-3 can be concise: Ubuntu 26.04 LTS scope identified, `openssl` and `libssl3t64` at `3.5.5-1ubuntu3.5`, reboot completed, services healthy, and corrected images redeployed where applicable. That evidence turns a second advisory from patching noise into a verifiable security state.
