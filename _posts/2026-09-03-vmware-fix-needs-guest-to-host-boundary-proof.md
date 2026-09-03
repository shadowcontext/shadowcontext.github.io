---
title: "VMware Fix Needs Guest-to-Host Boundary Proof"
subtitle: "Two desktop hypervisor flaws make virtual adapters, shared folders and exact build evidence part of host protection."
description: "Broadcom fixed two VMware guest-to-host flaws; defenders should update Workstation and Fusion and verify risky integration features and builds."
date: 2026-09-03 16:11:20 +0400
layout: post
category: defense
tags: [VMware, virtualization, vulnerability-management, endpoint-security]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-09-03-vmware-fix-needs-guest-to-host-boundary-proof.svg
image_alt: "Abstract nested virtual machine and host layers separated by a luminous boundary, with network and shared-folder paths crossing toward a protected core"
key_points:
  - "CVE-2026-59346 can let an administrator inside a VM execute code on the host through a VMXNET3 adapter."
  - "CVE-2026-59347 reaches the host-side VMX process through HGFS, and Broadcom lists no workaround for either flaw."
  - "Workstation and Fusion 25H2 and 26H1 should move to 26H1u1, followed by build and feature-state verification."
sources:
  - title: "VMSA-2026-0007: VMware Workstation and Fusion updates address integer-overflow and buffer overflow vulnerabilities (CVE-2026-59346, CVE-2026-59347)"
    publisher: "Broadcom · September 3, 2026"
    url: "https://support.broadcom.com/web/ecx/support-content-notification/-/external/content/SecurityAdvisories/0/38288"
---

Broadcom has released VMware Workstation and Fusion 26H1u1 to fix two vulnerabilities that can carry code execution from a virtual machine into its host. The decisive boundary is not simply whether virtualization software is installed. Defenders need to know which builds are active, which guest-integration features are exposed and where untrusted or independently administered VMs run on valuable endpoints.

## What the advisory establishes

VMSA-2026-0007, published September 3, covers VMware Workstation and VMware Fusion versions 25H2 and 26H1 on their supported host platforms. Broadcom rates the combined advisory critical and identifies 26H1u1 as the fixed version for both products. It lists no workaround for either vulnerability.

CVE-2026-59346 is an integer-overflow vulnerability involving the VMXNET3 virtual network adapter. Broadcom assigns it a maximum CVSS 3.1 score of 9.3. An actor with local administrative privileges inside a VM configured with VMXNET3 may be able to execute code on the host.

CVE-2026-59347 is a stack-based buffer overflow in HGFS, the host-guest file-system component. It carries a maximum CVSS 3.1 score of 8.1. Broadcom says an actor with local administrative privileges in a VM may exploit it to execute code as the VM's VMX process on the host. The issues were privately reported; the advisory does not make a claim about exploitation in the wild, so defenders should treat this as urgent prevention rather than evidence of an incident.

## Find the desktop hypervisors that matter

Workstation and Fusion often sit outside server-virtualization inventories. Developers, malware analysts, support engineers and testers may install them locally, create short-lived guests and retain old machines as reusable snapshots. That flexibility can hide both vulnerable application builds and high-risk VM configurations from central asset views.

Start with endpoint software inventory across managed Windows, Linux and macOS systems. Record the installed product, actual running build and host owner. Then classify the guests: internally managed development images are not equivalent to machines used for external demonstrations, security research or untrusted software. A guest administrator should be considered capable of reaching the vulnerable code paths described by Broadcom.

Configuration evidence adds the necessary context. Identify guests using VMXNET3 and those with shared-folder functionality enabled. Those findings should influence rollout order, but they are not substitutes for the update because Broadcom provides no workaround. Prioritize hypervisors on privileged administration workstations, code-signing or build endpoints, systems holding sensitive repositories, and laptops where guests from outside the organization's normal trust boundary are opened.

## Update, then prove the boundary changed

Move affected Workstation and Fusion installations to 26H1u1 using the approved Broadcom packages. Before broad deployment, test critical guest networking, shared folders, snapshots, USB redirection and automation that depends on the hypervisor. Preserve business data through the organization's normal backup process, but avoid using snapshots as the sole rollback control; snapshots live inside the same virtualization environment being changed.

Verification should come from the endpoint after installation. Confirm the running application reports 26H1u1, restart hosts where the deployment procedure requires it, and reopen representative guests to ensure the updated components are loaded. Fleet dashboards should separate downloaded, installed and verified states. An installer exit code alone does not demonstrate that every endpoint stopped running an older build.

Where rapid patching is impossible, reduce exposure without presenting that reduction as a vendor workaround. Stop importing or running untrusted VMs, avoid granting guest administrator access to lower-trust users, and remove unnecessary host-guest integrations under change control. If operations permit, move risky analysis to isolated, disposable hosts that hold no reusable credentials or sensitive project material.

## Make VM trust an endpoint control

The lasting lesson is that a VM is an isolation mechanism with configured crossings, not an automatic security boundary. Virtual networking and shared files are useful precisely because they connect guest activity to host resources. Their state belongs in endpoint policy and vulnerability triage.

After this update, define who may administer guests, which integration features each use case requires and what data a virtualization host may retain. Monitor for unauthorized hypervisor installations and configuration drift. For especially sensitive endpoints, prohibit lower-trust VMs altogether.

Broadcom's fixed build closes these two reported paths. The stronger defensive result is evidence that every relevant host is updated and that each remaining guest-to-host connection exists for a documented reason.
