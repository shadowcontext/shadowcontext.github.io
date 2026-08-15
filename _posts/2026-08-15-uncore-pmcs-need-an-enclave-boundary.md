---
title: "Uncore Performance Counters Need an Enclave Boundary"
subtitle: "UncoreBleed shows that protecting enclave memory requires controlling what privileged performance monitoring can observe."
description: "UncoreBleed exposes an SGX side channel in Xeon uncore counters, making data-oblivious code and monitoring boundaries part of enclave assurance."
date: 2026-08-15 09:10:12 +0400
layout: post
category: defense
tags: [confidential-computing, side-channels, Intel-SGX, hardware-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-15-uncore-pmcs-need-an-enclave-boundary.svg
image_alt: "Abstract processor enclave surrounded by luminous memory paths, with an amber monitoring arc observing traffic outside the protected core"
key_points:
  - "Uncore performance counters remained active during the researchers' SGX enclave tests."
  - "The demonstrated attack assumes control of the operating system and hypervisor beneath the enclave."
  - "Enclave assurance must cover observable memory patterns, not only encrypted memory and page-table defenses."
sources:
  - title: "UncoreBleed: AEX-Free, High-Resolution, and Low-Noise Side-Channel Attacks on SGX Enclaved Execution"
    publisher: "USENIX Security '26 · 14 August 2026"
    url: "https://www.usenix.org/conference/usenixsecurity26/presentation/chen-decheng"
  - title: "UncoreBleed: AEX-Free, High-Resolution, and Low-Noise Side-Channel Attacks on SGX Enclaved Execution"
    publisher: "USENIX Security '26 paper · 14 August 2026"
    url: "https://www.usenix.org/system/files/conference/usenixsecurity26/sec26_prepub_chen-decheng.pdf"
---

A newly presented hardware-security paper challenges a comfortable assumption about confidential computing: isolating code and encrypting enclave memory do not make every surrounding observation channel disappear. The useful lesson for defenders is to define the boundary around what the platform can reveal, not only what ordinary software can read.

## What UncoreBleed demonstrates

The USENIX Security ’26 paper examines performance monitoring counters, or PMCs, during production-mode Intel Software Guard Extensions execution. The researchers confirmed that sensitive core counters were suppressed when code ran inside an SGX enclave. They found, however, that counters in the processor’s shared “uncore” domain continued recording events correlated with enclave activity.

Their work focuses on the `PKT_MATCH` event in the mesh-to-memory subsystem of SGX-capable Xeon processors. According to the paper, programmable address filtering let that event observe selected memory traffic at 64-byte granularity. The team reverse-engineered the filtering and address mapping across multiple Xeon generations, then used those observations to distinguish secret-dependent execution paths.

In two controlled case studies on machines owned by the researchers, the technique reconstructed visual information processed by an enclaved JPEG library and recovered RSA private-key bits from one decryption. The RSA experiment also ran with TLBlur and AEX-Notify protections in place. Those controls address attacks that rely on page faults, interrupts or enclave exits; UncoreBleed instead watched physical memory activity without inducing those events.

## The threat model matters

This is not a remote attack against any server that happens to use SGX. The paper assumes a privileged adversary with full control of the operating system and hypervisor beneath the enclave, knowledge of the compiled enclave code, and no need for a software flaw inside the enclave. That is a strong position, but resisting an untrusted host is also central to why confidential-computing enclaves exist.

The distinction should shape risk decisions. UncoreBleed does not show that every SGX workload is exploitable, nor does the paper report attacks in the wild. It shows that a host-level observer may retain a fine-grained signal when enclave behavior creates secret-dependent memory patterns. Defenders should therefore avoid translating “memory is encrypted” into the broader claim that the host cannot infer anything useful about execution.

The researchers also performed a preliminary TDX evaluation and found that the same counter could observe targeted traffic from a trust domain. They explicitly leave a complete TDX attack as future work. That result is a reason to review assumptions, not proof that the demonstrated SGX case transfers unchanged to every confidential-VM deployment.

## There is no simple patch story

The authors identify disabling uncore PMCs—or at least `PKT_MATCH`—during enclave execution as the straightforward mitigation, while noting that this would reduce legitimate performance visibility. They report that Intel classified the finding as outside its threat model and did not plan a specific mitigation. Intel’s response, as described in the paper, points developers toward constant-time or data-oblivious enclave code.

That leaves a design trade-off rather than a version number. The paper says strong runtime randomization could frustrate target mapping, while fully data-oblivious memory access could remove the distinguishing patterns. It also notes substantial performance or engineering costs for these approaches. Interrupt-rate detection and page pinning do not address this channel because it neither creates interrupts nor depends on page-table observation.

## Turn the finding into assurance work

Teams using SGX should first inventory which workloads still depend on it, which Xeon platforms host them, and whether the confidentiality claim includes protection from a malicious OS or hypervisor. Record that claim explicitly; an enclave used only to reduce accidental host access has a different requirement from one expected to protect cryptographic keys from the infrastructure operator.

For high-assurance workloads, review sensitive routines for secret-dependent control flow and memory access. Constant-time claims should cover memory behavior across the complete compiled path, including third-party libraries, rather than only source-level arithmetic. Treat privileged access to performance-monitoring facilities as part of the platform’s observation surface, and track whether the processor vendor or cloud service later changes its guidance.

Finally, test existing detections against the actual channel they claim to catch. A control that watches enclave exits can work as designed and still miss passive uncore observation. UncoreBleed’s durable defensive message is precise: isolation evidence is incomplete until it accounts for the shared hardware outside the enclave that can still see the work move.
