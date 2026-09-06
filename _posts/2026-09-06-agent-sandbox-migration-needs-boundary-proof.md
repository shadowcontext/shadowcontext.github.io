---
title: "Agent Sandbox Migration Needs Boundary Proof"
subtitle: "GitHub’s runtime consolidation makes isolation intent—not configuration syntax—the migration target."
description: "GitHub is consolidating agent microVM support on Cloud Hypervisor; defenders should prove each workflow retains its intended isolation boundary."
date: 2026-09-06 14:10:00 +0400
layout: post
category: ai-security
tags: [agentic-workflows, sandboxing, microvm, ci-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-06-agent-sandbox-migration-needs-boundary-proof.svg
image_alt: "Abstract agent workload enclosed in a luminous microVM chamber while deprecated isolation paths fade into the background"
key_points:
  - "GitHub is deprecating the gVisor and Docker sbx runtime choices for Agentic Workflows."
  - "Cloud Hypervisor is the supported microVM direction but remains a preview with strict runner requirements."
  - "Migration evidence should cover the selected runtime, generated lock file and effective boundary."
sources:
  - title: "MicroVM Support Is Consolidating on Cloud Hypervisor"
    publisher: "GitHub Agentic Workflows · September 5, 2026"
    url: "https://github.github.com/gh-aw/blog/2026-09-05-cloud-hypervisor-consolidation/"
  - title: "Agent Runtime Selection"
    publisher: "GitHub Agentic Workflows · accessed September 6, 2026"
    url: "https://github.github.com/gh-aw/reference/agent-runtimes/"
---

GitHub is narrowing the specialized sandbox choices for its Agentic Workflows project. The project’s September 5 notice says `gvisor` and `docker-sbx` are deprecated and will be removed in a future release, while `cloud-hypervisor` becomes the supported direction for workflows that need a hardware-virtualized boundary.

This is more than configuration maintenance. A migration can succeed syntactically while changing the security boundary around an agent that processes untrusted issues, pull requests or repository content. Defenders should therefore preserve the workflow’s isolation intent and collect evidence that the replacement runtime is actually in effect.

## What GitHub changed

GitHub says the default `docker` runtime remains available with network isolation and proxy enforcement. Its specialized options previously included gVisor, which interposes a user-space kernel, and Docker sbx, which places the agent in a KVM-backed microVM. Maintaining those paths alongside Cloud Hypervisor created separate installation, compatibility and troubleshooting surfaces, according to the project.

Cloud Hypervisor is also a KVM-backed microVM option, but it is currently in preview. GitHub’s notice limits the supported path to a GitHub-hosted Ubuntu x86_64 runner with `/dev/kvm`. The compiler adds host checks and provisions runtime assets pinned by digest.

Those details define applicability. A workflow does not gain a microVM boundary merely because its configuration names Cloud Hypervisor; the runner must satisfy the platform and virtualization requirements, and compilation must accept the combination. Conversely, removing a deprecated runtime setting selects the default Docker profile. Docker is still sandboxed, but it shares the runner host’s kernel and is not equivalent to a microVM boundary.

## Preserve the threat model

Start by finding workflows that explicitly select `gvisor` or `docker-sbx`. For each one, record why the stronger runtime was chosen. Useful questions include whether the agent reads contributions from untrusted users, executes generated commands, invokes package managers, accesses private source, or can reach credentials and write-capable tools.

That inventory separates an incidental configuration choice from a control with a documented purpose. If hardware virtualization was required to constrain hostile workload behavior, falling back to default Docker because the current runner lacks KVM is a security decision, not a harmless compatibility fix. That conclusion is ShadowContext analysis based on the different boundaries described in GitHub’s runtime reference.

Do not treat every workflow identically. A read-only reporting job with tightly mediated outputs may justify a different profile from an agent that builds contributor-controlled code. The goal is to match runtime isolation, network policy, token permissions and output controls to the actual capabilities and inputs of each job.

## Test the effective boundary

GitHub directs maintainers to compile each changed workflow and review the generated lock file. Make both artifacts part of the change review: the human-readable workflow records intent, while the lock file shows what the compiler resolved. Reject unsupported runner combinations and unexpected runtime changes before merge.

Then run a representative canary on the intended runner class. Confirm that required host checks pass, the runtime assets resolve to expected digests, and job logs identify the selected isolation backend. Exercise normal repository reads, approved network destinations and permitted outputs so the test demonstrates usability as well as containment. A nominally stronger boundary that breaks routine jobs will invite emergency bypasses later.

Also test failure behavior. A runner without `/dev/kvm`, an unsupported architecture or an unavailable pinned asset should stop clearly rather than continue under a weaker profile. GitHub states that its compiler supplies host checks; defenders should retain the failed-canary evidence that proves those checks operate in their environment.

## Make deprecation measurable

Track the migration with three states: deprecated runtime found, replacement approved, and effective boundary verified. Do not close the work item at “configuration updated.” Record the runner image, compiled lock-file revision, observed runtime and test result alongside the workflow owner.

Because Cloud Hypervisor remains in preview, monitor release notes for requirement or behavior changes and repeat the canary after runner-image and Agentic Workflows upgrades. Keep rollback plans explicit, but do not let rollback silently substitute a shared-kernel boundary where the risk decision required a microVM.

The durable lesson is that a sandbox name is not the control. The control is the isolation property the workflow needs, supported by a compatible runner and verified at execution time. Runtime consolidation can simplify maintenance, but only evidence shows that simplification did not weaken the boundary around the agent.
