---
title: "Sudo Intercept Fix Needs Policy-Path Proof"
subtitle: "A newly disclosed bypass shows why command controls must cover every execution path they claim to govern."
description: "CVE-2026-82474 exposes a gap in Sudo intercept mode; defenders should verify feature use, package status, policy coverage, and logging."
date: 2026-08-30 10:10:20 +0400
layout: post
category: defense
tags: [sudo, linux, access-control, vulnerability]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-30-sudo-intercept-fix-needs-policy-path-proof.svg
image_alt: "Abstract layered command gateway with converging paths passing through a luminous verification boundary"
key_points:
  - "CVE-2026-82474 affects Sudo through 1.9.17p2 when ptrace-based intercept mode is used."
  - "The upstream patch adds policy interception and subcommand logging for the missed execution path."
  - "Defenders should verify configuration, distribution package status, policy behavior, and audit evidence."
sources:
  - title: "Sudo through 1.9.17p2 Intercept Policy Bypass via execveat"
    publisher: "VulnCheck · August 29, 2026"
    url: "https://www.vulncheck.com/advisories/sudo-through-1.9-17p2-intercept-policy-bypass-via-execveat"
  - title: "Add intercept and log_subcmds support for execveat(2)."
    publisher: "Sudo project · August 29, 2026"
    url: "https://github.com/sudo-project/sudo/commit/71fbe42dcd5a1c8f799540583a2dfb2ae6221edf"
  - title: "CVE-2026-82474"
    publisher: "Debian Security Tracker · August 30, 2026 status checked"
    url: "https://security-tracker.debian.org/tracker/CVE-2026-82474"
---

A newly disclosed Sudo vulnerability is narrow in configuration but broad in lesson: an enforcement feature is only as reliable as its coverage of every path to the protected action. CVE-2026-82474 concerns Sudo's ptrace-based intercept mode, where one system-call path could escape the expected policy check and subcommand logging.

For defenders, the right response is not a fleet-wide assumption that every Sudo installation is equally exposed. It is a focused check of feature use, package state, policy intent and observable behavior.

## What the disclosure establishes

VulnCheck's August 29 record says Sudo through version 1.9.17p2 fails to apply intercept policy checks to the `execveat` system call when ptrace-based intercept mode is active. A user already permitted to run specific commands could use that uncovered execution path to run a program the policy was meant to deny. The same gap also bypassed the logging expected from that intercept path.

That scope matters. This is not described as an unauthenticated network flaw, and the record does not say that an ordinary user with no delegated Sudo capability can trigger it. Exposure depends on an environment using the affected intercept mechanism and relying on it to constrain commands launched beneath an allowed command.

The published CVSS 3.1 score is 7.8, rated high, with local access and low privileges required. No source used here reports active exploitation. Those facts support prompt review without turning severity into evidence of compromise.

## The fix closes an enforcement gap

The upstream Sudo commit is unusually useful because it states the control failure and the intended correction. Its summary says the change adds intercept and `log_subcmds` support for `execveat(2)`. The commit explains that Sudo had previously allowed that call in intercept mode to support its own file-descriptor execution setting. The repair resolves the referenced file descriptor to a path so a path-based Sudoers policy can evaluate it.

The defensive lesson is larger than one call. A policy engine may correctly evaluate the routes it sees while still providing incomplete control if an equivalent route reaches the same action unseen. Logging has the same dependency: an audit trail can look clean because activity was blocked, or because the relevant path never entered the logging boundary.

The commit is evidence that upstream code has changed; it is not proof that a maintained package containing the fix has reached every distribution or host. Debian's tracker, checked August 30, lists its tracked releases as vulnerable and the source package as unfixed. Other distributions may make different backporting and release decisions, so version strings alone should not be treated as universal proof.

## A defensible verification sequence

Start by identifying systems where Sudo's intercept feature is actually enabled and where `log_subcmds` or command-level restrictions are part of the security design. Prioritize shared administration hosts, build systems and other machines where delegated operators can run a constrained command set. Systems that do not use the affected mode should still be inventoried, but they should not displace confirmed affected configurations in the queue.

Next, follow the operating-system vendor's advisory and package channel. Record the installed package build, not only the upstream Sudo version, because distributions often backport security changes without adopting a new upstream number. Where no fixed package is available, reassess whether the affected feature should remain enabled and reduce delegated permissions to the minimum necessary. Any temporary change should be tested for operational impact and tracked to reversal.

Finally, validate the control rather than stopping at installation success. In a safe test environment, use approved positive and negative policy cases to confirm that allowed subcommands still run, denied subcommands remain denied, and the expected audit events arrive with the identity and command context responders need. Avoid recreating public bypass techniques on production hosts.

That evidence chain—configuration, package provenance, policy outcome and logging—turns a patch task into control assurance. CVE-2026-82474 is a reminder that the strongest-looking rule is only as strong as the least-observed route around it.
