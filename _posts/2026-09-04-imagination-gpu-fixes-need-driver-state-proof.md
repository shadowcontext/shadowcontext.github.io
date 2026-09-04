---
title: "Imagination GPU Fixes Need Driver-State Proof"
subtitle: "Two newly published Graphics DDK flaws show why GPU isolation depends on the loaded driver and firmware, not the hypervisor label alone."
description: "New Imagination Graphics DDK CVEs make driver inventory, OEM update mapping, and post-reboot verification essential for GPU isolation."
date: 2026-09-04 15:10:45 +0400
layout: post
category: defense
tags: [gpu-security, virtualization, vulnerability-management, firmware]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-04-imagination-gpu-fixes-need-driver-state-proof.svg
image_alt: "Abstract layered GPU processor behind a luminous boundary, with isolated memory blocks on either side"
key_points:
  - "CVE-2026-45197 can cross a guest's virtual GPU memory boundary through a firmware race condition."
  - "CVE-2026-45200 lets unprivileged software trigger kernel heap corruption through GPU driver calls."
  - "Defenders should map vendor DDK versions to deployed device images and verify the loaded state after updating."
sources:
  - title: "CVE-2026-45197"
    publisher: "CVE Program · 4 September 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-45197"
  - title: "CVE-2026-45200"
    publisher: "CVE Program · 4 September 2026"
    url: "https://www.cve.org/CVERecord?id=CVE-2026-45200"
  - title: "GPU DRIVER VULNERABILITIES"
    publisher: "Imagination Technologies · 24 August 2026"
    url: "https://www.imaginationtech.com/gpu-driver-vulnerabilities/"
---

Two vulnerability records published on September 4 put the graphics stack back inside the security perimeter. Both affect Imagination Technologies Graphics DDK for Linux, but they cross different trust boundaries: one concerns a guest virtual machine and GPU firmware, while the other begins with software running as a non-privileged local user. The practical response is not simply “update the GPU.” Defenders need proof of which driver and firmware their actual devices load.

## Two flaws, two exposure paths

CVE-2026-45197 is a time-of-check to time-of-use flaw in the GPU firmware path. According to the CVE record, kernel software running inside a guest VM can submit improper commands that cause reads or writes outside that guest's virtualised GPU memory. The firmware validates guest-provided data before use, but the race condition can invalidate the earlier result. That makes the virtual GPU memory boundary—not merely application stability—the security concern.

The record identifies several affected Graphics DDK Linux release lines, including 1.18 RTM2, 23.2 RTM2, 24.2 RTM2, 25.1 RTM2 through 25.3 RTM, and 26.1 RTM1. It lists 26.1 RTM2 as unaffected. Those details matter because a virtualisation platform can be current while a bundled graphics component remains on an affected branch.

CVE-2026-45200 is a separate driver issue. The CVE description says software running as a non-privileged user can make improper GPU driver IOCTL calls with a particular combination of allocation flags. Freeing that allocation can produce a double free and kernel heap corruption. Imagination's vulnerability page identifies affected DDK releases from 24.2 RTM2 through 26.1 RTM1; the CVE record lists 26.1 RTM2 as unaffected.

Neither record, as published, claims observed exploitation. That absence should prevent unsupported emergency language, but it does not remove the need to identify systems where untrusted local workloads or guest GPU access make the relevant path reachable.

## Why ordinary patch inventory is insufficient

GPU software often arrives through an OEM image, device firmware package, operating-system build, cloud host image, or embedded product update. The package name visible to an asset tool may not expose the underlying DDK release, and the version installed on disk may differ from the module loaded into a running kernel. Firmware can add another independent state.

That creates a translation problem for vulnerability management. A team must connect the CVE's DDK release terminology to the version scheme used by its hardware or platform supplier. A generic “Linux patched” result does not establish that the affected graphics driver was replaced. Likewise, updating a guest does not prove that the host-side component or GPU firmware changed.

The distinction is especially important for systems that share accelerated graphics among tenants, sandboxes, remote desktops, build workers, or other workloads with different trust levels. CVE-2026-45197 explicitly places guest-controlled input on a path to firmware-managed memory access. In that setting, the GPU stack participates in isolation and should be governed like the hypervisor, not treated as display plumbing.

## A defensible update workflow

Start by finding devices and hosts that use Imagination GPU technology, then record the running kernel module, associated user-space libraries, firmware, device model, operating-system image, and supplier update channel. Ask the OEM, cloud provider, or platform maintainer which shipped package maps to Graphics DDK 26.1 RTM2 or another unaffected build; do not infer that mapping from a marketing version.

Prioritise environments where untrusted users can run local code or where guests receive virtualised GPU access. If a fixed supplier image is not yet available, reducing GPU access for lower-trust workloads is a reasonable temporary risk decision, provided application owners test the operational effect. This is an editorial inference from the documented attack preconditions, not a vendor-prescribed workaround.

After deployment, reboot where the supplier requires it and capture the loaded driver and firmware state. Re-run representative GPU workloads, confirm that isolation policy still applies, and retain the evidence with the change record. The useful completion condition is not that an updater returned success. It is that every in-scope device is demonstrably running a supplier-confirmed, unaffected graphics stack.

## The broader control lesson

Accelerators increasingly process AI, browser, desktop and multi-tenant workloads, yet their drivers and firmware can remain weakly represented in software inventories. These disclosures show why that gap matters: a GPU interface available to a guest or ordinary process can reach code operating with kernel or firmware authority.

Defenders should therefore treat accelerator provenance, version mapping and loaded-state verification as durable controls. The boundary is only as trustworthy as the exact graphics stack enforcing it.
