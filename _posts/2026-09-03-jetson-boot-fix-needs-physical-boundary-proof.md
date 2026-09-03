---
title: "Jetson Boot Fix Needs Physical-Boundary Proof"
subtitle: "A new Secure Boot bypass disclosure makes initialization code, firmware settings and device custody part of one trust decision."
description: "New Jetson Linux research shows why defenders must update affected branches and verify physical and pre-boot controls across edge AI fleets."
date: 2026-09-03 17:10:20 +0400
layout: post
category: defense
tags: [Jetson, secure-boot, edge-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-03-jetson-boot-fix-needs-physical-boundary-proof.svg
image_alt: "Abstract edge-computing module protected by layered boot rings and a sealed blue vault as an amber physical path is stopped at the outer boundary"
key_points:
  - "ONEKEY reports that physical access can turn trusted Jetson Linux initialization code into a Secure Boot bypass."
  - "The published fixed releases differ by branch, while the researchers list no fixed 38.x release."
  - "Defenders should pair updates with verified firmware access controls, device custody and post-flash validation."
sources:
  - title: "Security Advisory: Secure Boot Bypass on NVIDIA Jetson for Linux"
    publisher: "ONEKEY Research Lab · September 3, 2026"
    url: "https://www.onekey.com/resource/security-advisory-secure-boot-bypass-on-nvidia-jetson-for-linux"
  - title: "Jetson Linux r39.2.1 GA Release Notes"
    publisher: "NVIDIA · August 2026"
    url: "https://docs.nvidia.com/jetson/archives/r39.2.1/ReleaseNotes/Jetson_Linux_Release_Notes_r39.2.1.pdf"
  - title: "Jetson Linux r36.5.2 GA Release Notes"
    publisher: "NVIDIA · August 2026"
    url: "https://docs.nvidia.com/jetson/archives/r36.5.2/ReleaseNotes/Jetson_Linux_Release_Notes_r36.5.2.pdf"
  - title: "Jetson-Linux r35.6.5 GA Release Notes"
    publisher: "NVIDIA · July 2026"
    url: "https://docs.nvidia.com/jetson/archives/r35.6.5/ReleaseNotes/Jetson_Linux_Release_Notes_r35.6.5.pdf"
---

New research into NVIDIA Jetson Linux shows why Secure Boot cannot be treated as a complete answer to physical tampering. The reported weakness sits in trusted initialization code, before ordinary operating-system controls take over. For defenders running edge AI hardware outside tightly controlled server rooms, the practical response joins software versions, pre-boot configuration and device custody into one assurance task.

## What the disclosure establishes

ONEKEY Research Lab published its advisory on September 3 after reporting the issue to NVIDIA in May. The researchers describe a command-injection vulnerability in the initial RAM filesystem, or initrd, used during Jetson Linux startup. According to their account, an unprivileged attacker with physical access could manipulate boot inputs so that trusted initialization code executed unintended commands.

The consequence is a bypass of the intended Secure Boot guarantee, not a cryptographic break. ONEKEY says its test reached privileged execution early in startup and exposed the key protecting an encrypted root filesystem. The researchers assign a 7.0 High CVSS 4.0 score and require physical access in their vector. No CVE identifier was available on the advisory at publication.

The affected scope reported by ONEKEY covers Jetson Xavier, Orin and Thor families across specified Jetson Linux 35.x, 36.x, 38.x and 39.x releases. These are source-specific findings, not a claim that every Jetson device is remotely exposed or that exploitation has occurred in the wild.

## The version decision is branch-specific

ONEKEY identifies Jetson Linux 39.2.1, 36.5.2 and 35.6.5 as fixed releases for their respective branches. NVIDIA’s public release notes confirm that all three releases exist. The 39.2.1 notes describe that build as production-capable and say it includes fixes for security vulnerabilities, while the 36.5.2 and 35.6.5 notes also identify security-related fixes. The public notes do not identify this specific issue.

That distinction matters. The research advisory lists 38.2, 38.2.1 and 38.4 as vulnerable but does not list a fixed 38.x build. It says fixes were available for every major branch except 38.x at the time of writing. Operators should not infer an unlisted version number. They should obtain supported guidance from NVIDIA or their device supplier and use compensating controls until a vendor-approved path is available.

Inventory also needs to reach below the application layer. A fleet record that says only “Jetson” or “JetPack” is insufficient. Defenders need the module family, Jetson Linux branch, installed build, boot-media layout and ownership of the update process for each deployed unit.

## Physical access is part of the attack surface

The requirement for hands-on access narrows urgency, but it does not make the issue academic. Jetson modules are designed for edge workloads and may appear in factories, vehicles, robots, cameras or field enclosures where custody differs sharply from a data centre. ShadowContext’s analysis is that prioritisation should follow deployment conditions: publicly reachable equipment, shared laboratories, repair depots and devices handled by third parties deserve earlier attention than sealed units under monitored control.

Where an immediate update is unavailable, ONEKEY recommends restricting access to the firmware Device Manager with its documented timeout and password controls. It also discusses stronger platform-key provisioning for advanced physical threats. Those are sensitive lifecycle settings, so teams should validate them against the exact hardware design and vendor documentation rather than copy a generic configuration across production devices.

## Closure requires evidence after the flash

Start by mapping affected hardware to the correct supported release and testing the update on representative carrier boards, peripherals and boot media. Edge devices often combine custom kernels, storage layouts and recovery procedures; a successful package download is not proof that the intended boot components changed.

After deployment, record the running Jetson Linux version, confirm expected Secure Boot state and verify that firmware-management access is constrained. Test normal boot, recovery, encrypted-storage access and any remote-attestation workflow the deployment relies on. For devices that cannot yet move from 38.x, document the vendor case, physical protections and owner for follow-up.

The durable lesson is architectural: a verified boot chain is only as strong as every trusted parser and script inside it. Update evidence and physical-boundary evidence belong in the same control record.
