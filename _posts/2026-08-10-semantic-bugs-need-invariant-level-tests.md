---
title: "Semantic bugs need invariant-level security tests"
subtitle: "New systems research shows how testing intended security state can expose flaws that memory-focused sanitizers cannot see."
description: "SEMSAN research shows why fuzzing should validate filesystem, credential, and namespace invariants alongside memory safety."
date: 2026-08-10 21:09:43 +0400
layout: post
category: defense
tags: [software-security, fuzzing, vulnerability-research, secure-development]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-10-semantic-bugs-need-invariant-level-tests.svg
image_alt: "Abstract editorial illustration of software execution paths passing through layered filesystem, credential, and namespace checks before reaching a protected system core"
key_points:
  - "Memory safety does not prove that a program reached an authorized system state."
  - "SEMSAN lets testers express and monitor filesystem, credential, and namespace invariants."
  - "Security testing should pair conventional sanitizers with explicit application-level rules."
sources:
  - title: "SEMSAN: a Configurable Sanitizer for Detecting System-Level Semantic Bugs"
    publisher: "USENIX Association · August 10, 2026"
    url: "https://www.usenix.org/conference/woot26/presentation/sanft"
---

Software can be memory-safe during a test and still do something dangerous. A path can resolve outside an intended directory, a process can retain the wrong privilege, or a namespace boundary can fail while every pointer and buffer remains formally valid.

Research made openly available at WOOT ’26 on August 10 turns that gap into a practical testing problem. SEMSAN, developed by researchers at Ruhr University Bochum, adds checks for the security state a program is supposed to preserve. The work is vulnerability research, not a report of an organizational breach.

## What conventional sanitizers miss

Tools such as AddressSanitizer and UndefinedBehaviorSanitizer are highly effective at finding memory corruption and undefined behavior. The researchers’ central observation is that they do not identify every semantic bug: a program may interact with its environment in a formally valid way yet produce an unintended and insecure system state.

The distinction matters because many consequential flaws live at that boundary. The USENIX abstract names path traversal, command injection and arbitrary file writes as examples. None necessarily requires a buffer overflow. A fuzzer may reach the vulnerable behavior repeatedly without recognizing it as a failure if the process does not crash and no conventional sanitizer condition fires.

SEMSAN approaches the problem by letting analysts define small checks called Sanitizer Primitives. These monitor kernel events and validate security invariants while the target runs. Its higher-level utilities can inspect filesystem metadata, process credentials and namespace configurations, giving testers a way to ask whether an execution stayed within an intended security boundary.

## The evidence and its limits

According to the paper’s public summary, the eBPF-based implementation integrates with coverage-guided fuzzers. The researchers reproduced ten known CVEs and report finding five previously unknown vulnerabilities, including privilege-escalation flaws in Git and Docker, a path traversal in ViewVC, and remote code execution in Grafana. They state that all were responsibly disclosed and are either patched or moving through the patch process.

The performance results are also bounded rather than universal. In the reported macro-benchmarks, Apache and PostgreSQL showed less than one percent overhead. Micro-benchmarks with continuous sanitizer triggering showed overhead between three and 20 percent in the worst cases. Those measurements support practical evaluation, but they do not guarantee the same cost for every workload, kernel, invariant or test harness.

Defenders should also avoid treating SEMSAN as a replacement for memory-safety tooling. The research addresses a different detection gap. Its value is additive: conventional sanitizers catch invalid low-level operations, while invariant checks can flag valid operations whose combined system effect violates policy.

## Turn security assumptions into executable rules

The immediate lesson for secure-development teams is to write down the conditions that must remain true during testing. A file-conversion service might require every output to remain beneath a designated directory. A helper process might be forbidden from gaining or retaining elevated credentials. A containerized component might be required to stay inside a particular namespace configuration.

Those rules should come from the application’s threat model and architecture, not from a generic checklist. Start with a small number of high-consequence invariants around write locations, privilege transitions, process creation and isolation boundaries. Run them beside existing coverage-guided fuzzing and memory sanitizers, then treat an invariant violation as a security-relevant test failure even when the application continues normally.

This also changes triage. A clean crash count is not proof of safe behavior. Teams need to retain the event context that explains which rule failed, under what build and configuration, and whether the same behavior is reachable in production. That record makes remediation testable instead of reducing it to a code change with no enduring assertion.

## Build proof around intended state

Security reviews often ask whether code executed without errors. SEMSAN suggests a stronger question: did execution preserve the states the system was designed to protect?

Defenders can apply that principle even before adopting a new framework. Add negative tests for directory boundaries, privilege changes and isolation assumptions. Make build pipelines fail on policy violations, not only crashes. Preserve regression cases after a fix, and verify them across the configurations that change operating-system interactions.

The broader defensive gain is precision. When teams express a security assumption as an executable invariant, fuzzing can search for violations at scale and future releases can prove that the boundary still holds. Memory safety remains essential; it is simply not the whole definition of secure behavior.
