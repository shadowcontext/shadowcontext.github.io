---
title: "Gitea Runner Fix Needs Approval Invariants"
subtitle: "Version 1.27.3 closes a workflow-state gap that could send unreviewed fork code to self-hosted runners."
description: "Gitea 1.27.3 fixes an approval bypass in fork pull-request workflows, reinforcing why every runner state transition must recheck trust."
date: 2026-08-30 15:08:53 +0400
layout: post
category: defense
tags: [gitea, ci-cd, self-hosted-runners, vulnerability]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-30-gitea-runner-fix-needs-approval-invariants.svg
image_alt: "Abstract branching workflow lanes stopped by a luminous approval boundary before reaching an isolated runner core"
key_points:
  - "Gitea 1.27.3 fixes CVE-2026-66877, which affects versions through 1.27.2."
  - "The vulnerable path could dispatch unreviewed fork workflow code to self-hosted runners."
  - "Defenders should upgrade and keep untrusted pull-request jobs away from privileged runner environments."
sources:
  - title: "RCE on self-hosted runners | fork-PR approval gate (`NeedApproval`) bypass via job-level concurrency cancellation"
    publisher: "Gitea · August 29, 2026"
    url: "https://github.com/go-gitea/gitea/security/advisories/GHSA-v2w8-m4gr-qj65"
  - title: "Release v1.27.3"
    publisher: "Gitea · August 29, 2026"
    url: "https://github.com/go-gitea/gitea/releases/tag/v1.27.3"
---

Gitea has released version 1.27.3 with a fix for a high-severity flaw in the approval boundary around fork pull-request workflows. The issue matters most where Actions jobs run on self-hosted infrastructure: a control intended to hold unfamiliar contributors’ code for review could be bypassed through an unexpected workflow-state transition.

The immediate action is an upgrade. The durable lesson is broader: approval cannot be represented only by a temporary queue state. It must remain an invariant whenever a scheduler cancels, wakes, re-emits or dispatches work.

## What the advisory confirms

Gitea’s advisory identifies the flaw as CVE-2026-66877 and assigns it a CVSS score of 8.7. Versions through 1.27.2 are affected; 1.27.3 is the patched release. The exposure applies to repositories that accept fork pull requests and execute those workflows on self-hosted runners. The project says any user able to open a pull request can reach the vulnerable condition.

Under the intended design, jobs from a first-time fork contributor remain blocked until a maintainer approves the run. The advisory explains that another legitimate run using the same job-level concurrency group could cause the pending run to be reconsidered. During that path, remaining jobs could move from blocked to waiting and then be collected by a runner without the approval requirement being checked again.

That distinction is important for triage. This is not a claim that every Gitea server is equally exposed, nor does the advisory report active exploitation. The code-execution consequence is specific to unreviewed workflow code reaching a self-hosted runner. Gitea also says fork pull-request secrets remain withheld and the run token stays read-only, but those limits do not neutralize access to the runner host itself.

## Why the runner boundary carries the risk

A self-hosted runner is not merely a disposable execution slot. Depending on its design, it may have network routes, local caches, persistent workspaces or credentials left for later trusted jobs. The Gitea advisory explicitly lists internal network reachability, runner-local material and persistence into subsequent builds among the potential consequences.

The failure mode is a useful example of distributed authorization. The original approval decision was correct, but downstream components treated job status as sufficient evidence. When concurrency handling changed that status, the trust decision did not travel with it. Security review therefore has to follow the whole state machine, not just the interface where a maintainer clicks approve.

Gitea’s 1.27.3 release notes describe the corresponding change as enforcing fork pull-request trust boundaries. The same release contains multiple other security fixes, so operators should treat the version as a security baseline rather than attempt to isolate one narrow patch.

## A defensive rollout that proves the boundary

Inventory Gitea instances and record the running version first. Prioritize any installation at 1.27.2 or earlier where fork pull requests can trigger Actions on self-hosted runners. Upgrade to 1.27.3, then verify the application reports the new version and that runner services reconnect normally. Gitea states that instances without fork pull-request workflows on self-hosted runners are not exposed to this issue’s code-execution impact, but the upgrade remains the prescribed fix.

While rollout is pending, disable that workflow path or move untrusted pull-request jobs away from self-hosted runners. Avoid relying on secret withholding as the sole safeguard: a read-only token does not remove the host and network privileges of the runner process.

After patching, test the policy rather than only the happy path. Use a harmless fork pull request from a first-time contributor and confirm that jobs remain non-runnable through concurrency cancellation, replacement and wake-up events until explicit approval. Capture scheduler and runner evidence showing that no task was assigned early.

## The engineering lesson

CI/CD authorization should be checked at the last responsible moment. A scheduler may make a sound decision when a run enters the queue, yet later transitions can invalidate assumptions about who approved what. Dispatch is therefore a security boundary, not a mechanical final step.

For defenders, the practical pattern is simple: bind approval to the run’s identity and trust context, revalidate it at every route to execution, and isolate runners so a missed check has limited reach. Gitea 1.27.3 repairs the immediate defect. Runner isolation and transition-focused testing reduce the cost of the next state-machine surprise.
