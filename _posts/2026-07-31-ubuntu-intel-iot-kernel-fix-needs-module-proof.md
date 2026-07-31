---
title: "Ubuntu Intel IoT Kernel Fix Needs Module-Level Proof"
subtitle: "Canonical's track-specific update requires defenders to verify the running kernel and every dependency rebuilt across its ABI change."
description: "Ubuntu's Intel IoT kernel update requires a reboot, correct package-track mapping, and proof that third-party modules returned safely."
date: 2026-07-31 16:09:11 +0400
layout: post
category: defense
tags: [ubuntu, linux-kernel, iot-security, patch-verification]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-31-ubuntu-intel-iot-kernel-fix-needs-module-proof.svg
image_alt: "Abstract industrial edge processor surrounded by a reboot arc and reconnected kernel-module tiles in blue and amber"
key_points:
  - "Canonical's July 31 notice covers dedicated Intel IoT kernel tracks on Ubuntu 22.04 and 20.04 LTS."
  - "The corrected package must be running after a reboot; an installed image alone is not closure."
  - "An ABI change makes third-party module rebuilds and post-update functional checks part of the security fix."
sources:
  - title: "USN-8620-3: Linux kernel (Intel IoTG) vulnerabilities"
    publisher: "Ubuntu Security · July 31, 2026"
    url: "https://ubuntu.com/security/notices/USN-8620-3"
---

Canonical has issued a new Ubuntu security notice for kernel packages built specifically for Intel IoT and Intel IoT real-time platforms. The update closes a broad set of Linux kernel flaws, but its most useful operational message is narrower: this is a track-specific change that is not complete until the corrected kernel is running and its dependent modules have returned safely.

For edge and operational deployments, that distinction matters. A successful package transaction can still leave an old kernel active, while an apparently successful reboot can hide a failed out-of-tree driver or security sensor.

## What the notice changes

USN-8620-3 applies to Ubuntu 22.04 LTS and 20.04 LTS, but not through one universal package. On 22.04, Canonical identifies the `linux-intel-iot-realtime` family and lists `linux-image-5.15.0-1104-intel-iot-realtime` version `5.15.0-1104.106` among the corrected builds. The real-time kernel is available with Ubuntu Pro.

For Ubuntu 20.04, the notice covers the `linux-intel-iotg-5.15` line and lists `linux-image-5.15.0-1107-intel-iotg` version `5.15.0-1107.113~20.04.1`; Canonical marks that fix as available with Ubuntu Pro. Related metapackages are also listed in the advisory and should remain part of the inventory because they keep systems following the intended kernel stream.

The notice spans many kernel areas, including architectures, filesystems, networking, memory management, device drivers, virtualization and security frameworks. Canonical says the issues could possibly be used to compromise a system. It does not state that every listed flaw applies equally to every device or that any is being actively exploited, so local exposure and hardware configuration remain necessary for prioritization.

## Track identity comes before rollout

The label “Ubuntu IoT device” is not precise enough to select or verify this update. Defenders need the operating-system release, installed kernel flavor, metapackage, running kernel, architecture and support entitlement for each device. A generic kernel baseline can miss the dedicated Intel IoT line, and a package-only scanner can report success while the host continues to execute the previous image.

Start with authoritative device inventory rather than assuming that similarly deployed appliances share one build. Group rollout rings by release, kernel flavor, hardware model and third-party module set. Confirm that the appropriate repositories and entitlements are available before the maintenance window; an update plan that cannot retrieve the relevant package is not a mitigation.

The advisory's long list of corrected subsystems should not become a reason to invent a single severity for the whole bundle. Prioritize devices according to reachable interfaces, untrusted input paths, workload criticality and recovery difficulty. That produces a defensible sequence without overstating what the source confirms.

## The ABI change expands the test

Canonical requires a reboot after the standard system update. It also warns that an unavoidable kernel ABI change may require third-party kernel modules to be recompiled and reinstalled. Standard metapackages should handle the supported kernel transition unless they were manually removed, but out-of-tree dependencies still need explicit attention.

Those modules may provide network interfaces, storage access, industrial-device connectivity, monitoring or endpoint controls. Their exact role is environment-specific. Before rollout, record the expected modules, dependent services, device communications and security telemetry on a representative unit. Preserve a tested recovery path appropriate to the device rather than relying on remote access that the kernel change itself could disrupt.

After reboot, verify the running kernel against the fixed build for that exact track. Then confirm that expected modules loaded without build errors, network and storage paths are healthy, application services recovered, device communications behave normally, and monitoring resumed. A staged ring should remain under observation long enough to reveal delayed workload or driver failures before wider deployment.

## Close on evidence, not installation

The completion record should connect four facts: the device was mapped to the right package track, the corrected image was installed, the system booted that image, and every required kernel-dependent function passed a health check. Exceptions should distinguish a pending reboot from a module failure or an unsupported package state because each needs a different owner and remedy.

The durable lesson is that kernel patching on specialized systems is a state transition, not a download event. Version proof establishes that the security code is active; module and workload proof establishes that applying it did not silently remove a control or operational capability.
