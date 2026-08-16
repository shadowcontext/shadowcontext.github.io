---
title: "Scriban Parser Limit Needs Fail-Closed Proof"
subtitle: "A newly assigned CVE shows why a configured template limit is not a control unless it actually stops unsafe work."
description: "CVE-2026-74783 makes Scriban 7.2.1 the baseline and turns template-parser limits into a control that defenders should verify end to end."
date: 2026-08-17 01:10:31 +0400
layout: post
category: defense
tags: [vulnerability-management, dotnet, template-security, denial-of-service]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-17-scriban-parser-limit-needs-fail-closed-proof.svg
image_alt: "Abstract nested template ribbons halted at a luminous boundary before reaching a protected application core"
key_points:
  - "CVE-2026-74783 affects Scriban 6.6.0 through 7.2.0 and is fixed in 7.2.1."
  - "Exposure depends on whether attacker-influenced text can reach parsing or runtime evaluation paths."
  - "Defenders should test that limits terminate work and contain failures outside the host process."
sources:
  - title: "Scriban 6.6.0 through 7.2.0 Parser Recursion Denial of Service"
    publisher: "VulnCheck via CVE Program · 16 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/74xxx/CVE-2026-74783.json"
  - title: "ExpressionDepthLimit guard is non-enforcing — parser-recursion DoS in 6.6.0–7.2.0 (incomplete fix for GHSA-wgh7-7m3c-fx25 / GHSA-p6q4-fgr8-vx4p)"
    publisher: "Scriban · 24 May 2026"
    url: "https://github.com/scriban/scriban/security/advisories/GHSA-6q7j-xr26-3h2c"
  - title: "Release 7.2.1"
    publisher: "Scriban · 24 May 2026"
    url: "https://github.com/scriban/scriban/releases/tag/7.2.1"
---

A security limit that only raises a warning is telemetry, not containment. A newly published CVE record for the Scriban .NET templating library makes that distinction operational: applications can appear to enforce expression depth while parsing continues toward a process-ending stack overflow.

## What the new record establishes

The CVE Program published CVE-2026-74783 on 16 August. The record describes uncontrolled recursion in Scriban versions 6.6.0 through 7.2.0 and identifies 7.2.1 as the corrected release. Its central finding is narrow but consequential: the `ExpressionDepthLimit` guard detects excessive nesting without stopping recursive parsing.

Scriban's maintainer advisory says the affected parser continues descending after it records a non-fatal error. Deeply nested expressions can therefore exhaust the native thread stack, causing a `StackOverflowException` that terminates the host process. Both Scriban-native and Liquid-compatible parsing use the same expression parser, according to the advisory. Runtime evaluation helpers can also reintroduce parsing when attacker-influenced strings reach them.

This is an availability flaw, not evidence that every application using the package is remotely exploitable. Reachability depends on the host design: whether an untrusted user can supply or influence template text, whether a trusted template evaluates an untrusted string, and whether that work occurs inside a process that serves other requests. Those deployment facts should determine urgency.

## Why configuration evidence is insufficient

The defensive lesson reaches beyond one library. Teams often treat the presence of a limit, a non-default configuration value, or an error message as proof that expensive work has been bounded. None of those observations proves enforcement.

A limit is effective only if the over-limit path terminates computation before the protected resource is exhausted. For a parser, that means unwinding recursion or refusing additional input. For an evaluator, it means applying budgets across built-in functions and indirect evaluation paths. For the surrounding service, it means a single failed job cannot take down unrelated requests.

The maintainer advisory also characterizes this issue as an incomplete fix for earlier recursion problems. That history matters for validation: a regression test that merely checks whether an error flag was set can pass while the dangerous operation continues. Security tests need to assert the final state—parsing stops cleanly, the worker remains alive, and subsequent benign work succeeds.

## What defenders should verify now

Inventory the deployed Scriban package at the built-artifact and runtime levels, not only in a source manifest. Transitive dependencies, stale containers, long-lived services, and copied application directories can leave an older assembly active after a repository update. The maintainer's 7.2.1 release notes explicitly include stopping parsing at the expression-depth limit, making 7.2.1 the minimum relevant baseline for this issue.

Next, map every path that parses templates or evaluates template-derived strings. Classify the input trust level for each path and record which process performs the work. Systems that accept customer-defined templates, reporting expressions, message layouts, or other configurable rendering rules deserve particular attention. Disable unneeded dynamic-evaluation features where the application permits it.

After updating, use safe regression cases in a non-production environment to confirm that excessive nesting is rejected quickly and predictably. Avoid reproducing process-exhaustion conditions on shared infrastructure. Monitor parser failures, worker restarts, memory pressure, and request latency during the test, then confirm that a normal template still renders afterward.

## Make the host a second boundary

Library patching is the immediate action, but host architecture determines the blast radius of the next missed path. Treat untrusted template work as a bounded job: constrain input size, execution time, memory, concurrency, and output size at a layer independent of the template engine. Where business requirements permit user-authored templates, isolate rendering from the main web process and recycle workers cleanly after abnormal termination.

Finally, add a release gate that checks behavior rather than configuration. The useful proof is not “a depth limit is set.” It is “over-limit input stops, the failure is observable, the worker boundary holds, and healthy work continues.” CVE-2026-74783 is a compact reminder that fail-closed behavior must be demonstrated at the point where a safety budget is spent.
