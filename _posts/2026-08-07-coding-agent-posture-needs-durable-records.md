---
title: "Coding-Agent Posture Needs a Durable Security Record"
subtitle: "A new position paper argues that persistent gaps between an agent's mandate and effective authority need lifecycle ownership."
description: "New research proposes durable records for coding-agent authority gaps, with scoped remediation and verified closure beyond alert-by-alert triage."
date: 2026-08-07 19:10:05 +0400
layout: post
category: ai-security
tags: [ai-agents, coding-agents, authorization, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: routine
image: /assets/img/editorial/2026-08-07-coding-agent-posture-needs-durable-records.svg
image_alt: "Abstract coding-agent core within layered authority rings, with capability paths narrowed through a luminous verification boundary"
key_points:
  - "Agent risk can persist across sessions even when no individual component is defective."
  - "A useful record joins task mandate, effective authority, controls, scope, ownership, and evidence."
  - "Closure should prove that consequential reach was removed, narrowed, or reliably gated."
sources:
  - title: "The Vulnerability With No CVE: Managing Persistent Gaps Between Mandate and Authority in AI Coding Agents"
    publisher: "arXiv · August 6, 2026"
    url: "https://arxiv.org/abs/2608.05884"
---

A coding agent can have no vulnerable package and still possess more practical authority than its task requires. A new position paper proposes treating that persistent mismatch as a vulnerability-management object—one that remains open across sessions until authority or controls actually change.

The proposal is useful because it shifts attention from a suspicious command to the standing conditions that made consequential action reachable. It is also preliminary: the paper introduces a framework, not a validated scoring system or a measure of how common the problem is.

## The exposure is in the composition

The authors call their proposed record an agentic posture vulnerability, or APV. It describes a persistent, task-conditioned exposure assembled from the agent harness, tools, plugins, connectors, inherited identity, credentials, network reach, approval settings, environment boundaries and telemetry.

No single element necessarily establishes the weakness. A write-capable connector may be appropriate for one task; a long-lived credential may be tightly isolated; disabled confirmations may be acceptable in a disposable sandbox. Risk appears when the combined posture lets an agent reach a consequential effect that exceeds the documented mandate, lacks required mediation, or cannot be reconstructed well enough to govern that authority.

That distinction keeps the concept separate from a product vulnerability. Ordinary software defects should still receive identifiers and patches. The proposed record instead covers a deployed composition that may behave exactly as documented while granting unsafe reach. It also differs from an alert: an alert is evidence from one moment, whereas the posture can survive after that alert is closed and manifest through a different action later.

## Six patterns make the inventory practical

The paper organizes the idea into six recurring patterns: permissive autonomy or approval settings; unreviewed installed capabilities; over-broad connector authority; unmediated credential access; consequential execution paths without adequate evidence; and collapsed boundaries between development and sensitive environments.

For defenders, these patterns are starting points for inventory rather than standalone findings. The paper explicitly makes reachability and expected task classes part of the threshold. A generic logging gap, a tool that merely advertises a powerful operation, or a hypothetical prompt outside approved use does not automatically qualify.

The proposed minimum record is more demanding than a ticket titled “agent has broad permissions.” It should preserve the affected agents, identities, repositories, connectors, credentials, hosts and environments; the evidence for the task mandate; the consequential effects the agent can actually reach; the missing boundary or gate; linked runtime evidence; a remediation owner; any time-bounded risk acceptance; and the proof required for closure.

This structure gives security teams a way to deduplicate different detections that point back to the same standing exposure. Endpoint, cloud, identity, secret-scanning and database tools may each see a fragment. The durable record is meant to connect those fragments to ownership and a control change.

## Remediation must change effective authority

The paper's lifecycle starts by joining configuration, identity, capability, task and runtime evidence to confirm reachability. Teams then scope affected deployments, assign ownership, choose remediation or explicit risk acceptance, change the posture, and verify closure.

The preferred changes are concrete: default production access to read-only, issue short-lived task-scoped credentials, separate development and production identities, restrict connector write operations, route sensitive actions through monitored gateways, and require independent authorization immediately before irreversible effects. More detection can improve investigation, but it does not by itself reduce what the agent can do.

Verification should test the affected scope, not wait for one alarming command to disappear. Closure means demonstrating that the consequential effect is no longer reachable, has been narrowed to the task, or is reliably stopped at an independent gate. Configuration snapshots and benign denied-action tests can provide stronger evidence than a changed policy document alone.

## Treat the framework as a testable proposal

The authors are affiliated with Bluebear Security, which develops security technology for coding agents, and the paper does not evaluate a commercial product. Its motivating field vignette uses confidential operational records that cannot be independently reproduced. The authors state that the example does not establish prevalence, and that the framework's qualitative threshold needs empirical validation.

That limitation should shape adoption. Security teams do not need to rename every entitlement finding or create a new universal severity score. A measured pilot can test whether posture-level records reduce repeat triage, improve owner assignment, shorten exposure windows and produce more verified closures than alert-only handling.

The durable lesson is simpler than the new terminology: govern an agent by the effects it can cause for the task at hand, not by the permissions of any one component. When authority persists, the security record—and the obligation to prove closure—should persist with it.
