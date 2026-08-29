---
title: "io_uring restrictions need proof across exec boundaries"
subtitle: "A Linux kernel fix shows why sandbox policy must survive process transitions, not merely pass an initial configuration check."
description: "CVE-2026-80713 could drop io_uring task restrictions across exec, making transition-aware testing essential for Linux sandbox assurance."
date: 2026-08-30 00:09:34 +0400
layout: post
category: defense
tags: [linux, io-uring, vulnerability-management, sandboxing]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-30-io-uring-restrictions-need-exec-boundary-proof.svg
image_alt: "Abstract nested blue rings passing through an amber process boundary while an unbroken cyan guard arc remains in place"
key_points:
  - "CVE-2026-80713 concerns io_uring task restrictions being lost across exec."
  - "Exposure depends on both kernel lineage and use of the affected restriction workflow."
  - "Defenders should verify policy before and after process transitions, then confirm the fixed kernel is running."
sources:
  - title: "In the Linux kernel, the following vulnerability has been..."
    publisher: "GitHub Advisory Database · 28 August 2026, updated 29 August 2026"
    url: "https://github.com/advisories/GHSA-jh6f-w2gp-43jq"
  - title: "[PATCH v2] io_uring: preserve task restrictions across exec"
    publisher: "Linux io_uring mailing list · 30 July 2026"
    url: "https://lore.gnuweeb.org/io-uring/20260730192734.459247-1-fyonglkm%40gmail.com/T/"
---

A newly updated Linux kernel advisory is a useful warning for teams that treat sandbox policy as a one-time setup event. CVE-2026-80713 concerns a narrow `io_uring` path in which per-task restrictions could disappear when a task replaced its program with `exec`. A later ring could then be created without the limits that were meant to persist.

The practical lesson is larger than this one subsystem: a control is only dependable if it remains attached to the workload through every lifecycle transition that matters.

## What the kernel fix changes

The GitHub Advisory Database, drawing on the kernel vulnerability record, says per-task restrictions are intended to apply to every `io_uring` ring created by a task. Once installed, those restrictions should remain in force across `exec`, the operation that replaces a running process image with a new program.

The affected cleanup path did too much. During `exec`, it freed both the task's `io_uring` context and its per-task restriction. If the task created another ring after the transition, that new ring was unrestricted. The correction separates task-context cleanup from final task cleanup: the transition can discard the old context while retaining the restriction until the task actually ends.

This is a policy-continuity failure, not a general claim that every use of `io_uring` is exposed. The advisory describes a specific sequence: a task has used `io_uring`, has per-task restrictions installed, crosses an `exec` boundary, and then creates a new ring. Teams should preserve that precision during triage.

## Start with reachability, not the score

GitHub currently labels the record high severity and lists a CVSS 3.1 score of 8.4, with local access and low privileges in the vector. That score is useful for ordering investigation, but it does not prove that a particular host or workload can reach the vulnerable path.

First identify workloads that deliberately rely on per-task `io_uring` restrictions as a confinement mechanism. Then determine whether they execute another program and create a ring afterward. Kernel configuration, application behavior and the running kernel build all belong in the exposure decision. A package scanner that finds a CVE string cannot answer those questions by itself.

Version status also needs care. The accepted upstream patch was marked for the 7.1-and-later stable line, which sharply narrows the relevant lineage compared with the full history of `io_uring`. Distribution kernels can add or omit code independently of their displayed version. Administrators should therefore use their own vendor's package advisory and build metadata rather than translate upstream numbers mechanically.

## Test the transition as part of the control

For workloads that depend on these restrictions, assurance should cover the whole state change. In a safe test environment, record the allowed and denied `io_uring` operations before `exec`, repeat the checks after the new program starts, and verify that a newly created ring inherits the intended policy. The test should fail closed if the restriction state cannot be established.

That transition-aware check belongs beside other sandbox tests for privilege changes, namespace entry, re-execution and worker spawning. The common failure mode is not necessarily a missing control; it is a control that existed at initialization and silently detached later.

Telemetry can support the test, but it should not be mistaken for enforcement. Teams can inventory processes that use `io_uring`, trace relevant lifecycle transitions in staging, and flag unexpected ring creation after `exec`. Production observability should be designed to reveal policy drift without collecting sensitive workload content.

## Close remediation with runtime evidence

Where a vendor identifies an affected build, follow its supported update path. After installation, verify the kernel actually running on each host; a corrected package on disk does not replace the live kernel until the required reboot and workload recovery are complete. Confirm service health as well as the expected restriction behavior after restart.

Exceptions deserve explicit ownership. If an affected system cannot be updated promptly, reduce exposure through supported workload or platform controls, document what those controls do and do not cover, and schedule the same post-transition test. CVE-2026-80713 is a compact example of a durable defensive rule: prove that policy survives the boundary, not just that it was present before crossing it.
