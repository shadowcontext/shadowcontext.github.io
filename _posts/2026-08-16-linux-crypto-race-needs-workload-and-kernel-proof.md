---
title: "Linux Crypto Race Needs Workload and Running-Kernel Proof"
subtitle: "A newly documented AF_ALG race shows why cryptographic patching must connect kernel state to the workloads that use it."
description: "CVE-2026-74578 fixes an AF_ALG IV race that can expose concurrent plaintext; defenders should map use, update, reboot, and verify."
date: 2026-08-16 18:10:06 +0400
layout: post
category: defense
tags: [linux, cryptography, kernel-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-16-linux-crypto-race-needs-workload-and-kernel-proof.svg
image_alt: "Abstract cyan cryptographic streams passing through a synchronized circular gate while an amber state pulse is isolated"
key_points:
  - "CVE-2026-74578 fixes an AF_ALG race in which concurrent work could reuse attacker-influenced IV state."
  - "The stable fix makes the affected operation synchronous instead of preserving a fragile asynchronous path."
  - "Defenders should identify AF_ALG consumers and verify both the fixed package and the kernel actually running."
sources:
  - title: "crypto: algif_skcipher - force synchronous processing on trees without ctx->state"
    publisher: "Linux kernel CVE team · 16 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/74xxx/CVE-2026-74578.json"
---

A Linux kernel vulnerability published on Sunday turns a low-level concurrency detail into a cryptographic confidentiality problem. CVE-2026-74578 affects the AF_ALG symmetric-cipher path: under concurrent use, an in-flight operation could consume initialization-vector state changed after the socket lock was released.

This is not a reason to distrust Linux cryptography broadly. It is a reason to find the workloads that use this specific kernel interface, move them onto supported fixed kernels, and verify the update all the way through reboot and application health.

## What the record establishes

The Linux kernel CVE record says the asynchronous path in `skcipher_recvmsg()` passed socket-wide IV state directly into a cipher request. Once an asynchronous operation was submitted, processing could continue after the socket lock had been dropped. A concurrent change to that shared IV could therefore alter the state used by the in-flight request.

For counter and stream modes, the record says the resulting IV or keystream reuse could allow an unprivileged user to recover plaintext from a concurrent operation. That is the concrete security consequence. The source does not report active exploitation, a campaign, or affected organizations, and defenders should not infer any of those things.

The issue is assigned CVE-2026-74578. The record marks Linux from 4.14 onward as affected across several maintained branches and lists the first unaffected releases for those branches: 5.10.261, 5.15.212, 6.1.178, 6.6.145, 6.12.97, 6.18.40, and 7.1.5. Those are upstream stable coordinates, not universal package names. Distribution advisories remain the authority for vendor kernels that carry backports without matching an upstream version string.

## Why the fix removes concurrency

A tempting repair would be to copy the IV into request-local storage before asynchronous processing. The CVE analysis explains why that is incomplete. For cipher implementations with no separate state buffer, including CBC and CTR, multi-part chaining depends on an in-place IV writeback. Redirecting that state into temporary request memory can produce incorrect output after the memory is released.

Writing state back from the completion callback also collides with kernel execution rules: the callback may run in a context where taking a sleeping socket lock is not permitted. The stable fix therefore takes the simpler boundary and makes this AF_ALG operation synchronous. That removes both the IV race and the competing writeback race.

This is a useful engineering lesson. Concurrency is not automatically a feature worth preserving when correctness depends on shared cryptographic state. A narrower, synchronous path can be the safer stable-branch repair when restructuring the wider subsystem would add more risk. The CVE record says AF_ALG asynchronous use is rare in practice, but teams should test that assumption against their own workloads.

## Scope the operational response

Start with exposure evidence. Identify applications, libraries, appliances, or performance services that use Linux AF_ALG sockets for symmetric cryptography. Pay particular attention to shared systems where mutually untrusted local users or workloads can execute, because the described consequence requires concurrency and local capability. Ordinary use of application-level TLS does not by itself prove that AF_ALG is involved.

Then map each exposed system to its distribution's fixed build. Do not compare only the marketing release or a base container image: AF_ALG executes in the host kernel, so containers share the host's kernel state. Record the installed kernel package and the active kernel returned by the running system. An update staged on disk does not close a kernel flaw until the fixed image is booted.

Where patching must wait, reduce unnecessary local execution and workload sharing according to existing hardening policy. Avoid inventing cipher changes from the CVE description; an improvised cryptographic workaround may introduce a different correctness failure. The durable control is the vendor-supported kernel correction.

## Verify cryptographic service after reboot

Roll out through representative systems first. Confirm that the intended kernel boots, required crypto modules load, and applications using kernel cryptography complete their normal functional checks. Watch for latency or throughput changes where software may have depended on the asynchronous path, while recognizing that performance telemetry is not proof of security.

The closure record should join four facts: the workload uses or does not use AF_ALG, the distribution maps CVE-2026-74578 to a fixed package, that package is installed, and the fixed kernel is running. For cryptographic vulnerabilities, version inventory without workload context overstates exposure, while package inventory without runtime proof overstates remediation. Defenders need both halves.
