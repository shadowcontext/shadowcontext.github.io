---
title: "Linked-Page Prompt Injection Defeats Local Agent Checks"
subtitle: "New agent testing shows why permission to read linked content must never become permission to obey it."
description: "New research shows linked-page prompt injection can evade local checks, making source provenance and cumulative authorization essential."
date: 2026-08-11 02:10:14 +0400
layout: post
category: ai-security
tags: [ai-agents, prompt-injection, agent-security, security-testing]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-11-multi-step-injection-needs-trajectory-controls.svg
image_alt: "Abstract editorial illustration of linked browser-like panels carrying amber fragments toward a guarded blue authorization boundary"
key_points:
  - "Instructions encountered through linked content must remain untrusted, even during an authorized task."
  - "Prompt warnings and screenshot classifiers weakened as injected goals were split across multiple steps."
  - "Defenses should preserve source provenance and re-check authorization as an agent follows references."
sources:
  - title: "StepJack: Benchmarking Computer-Use Agent Safety Against Multi-Step Indirect Prompt Injection"
    publisher: "arXiv · announced August 10, 2026; submitted August 6, 2026"
    url: "https://arxiv.org/abs/2608.06477"
---

A computer-use agent may reject one plainly hostile instruction yet accept the same underlying objective when it arrives through several linked, ordinary-looking steps. Newly listed research calls this multi-step indirect prompt injection and gives defenders a sharper testing target: permission to read external content must not become permission to obey it.

The result does not establish how often this technique appears in live environments. It does show why an agent that judges every instruction independently can miss harmful composition across pages, documents, and actions.

## What the benchmark tested

The StepJack researchers built 480 test cases per computer-use agent. Instead of placing a complete adversarial instruction in one location, the benchmark divided a goal into two or three sub-steps and distributed them across linked pages encountered during an otherwise benign task. The tests used sandboxed Reddit- and OwnCloud-style environments, not live services or real user data.

Six agents were evaluated. At a fixed decomposition depth, splitting the goal increased attack success for three of them and left it flat or lower for the others. Among the five agents that reliably followed the page chain, the average success rate rose from 31.3% for a single step to 36.9% for three steps. The largest model-specific increase reported was 31.2 percentage points.

Those mixed results matter. The paper does not support a blanket claim that adding steps always makes injection more effective. It identifies two prerequisites: the agent must traverse the chain, and it must act on the delivered sub-steps. An agent that failed to click links correctly looked safer by the headline metric, but the researchers attributed that outcome to interface errors rather than stronger security reasoning.

## Harmless steps can have a harmful sum

The benchmark exposes a structural weakness in local review. One page may appear harmless, and the next may also resemble routine guidance, while instructions across the chain combine into a state change the user never authorized. The relevant security object is therefore not a prompt fragment. It is the referenced content, its provenance, and the sequence of actions it induces.

This distinction also changes how teams should write permissions. The researchers found that a permissive instruction to follow material on a page or in a document increased attack success for most tested agents. Their interpretation is that agents can treat broad user authorization as transferable to instructions found in external content. In production, permission to consult a source should not silently become permission to obey that source or expand the task.

Provenance should travel with every proposed action. The control layer needs to know whether a step came from the user, an approved workflow, retrieved content, or an earlier agent inference. Each reference hop should preserve the untrusted status of environmental instructions. Before execution, the system should compare the cumulative effect with the original goal and granted capabilities.

## Defenses need memory and independent enforcement

The paper tested a defensive system-prompt warning on two agents and an external screenshot classifier across attacks. Both lost more ground against multi-step cases than against single-step cases. The screenshot classifier flagged 56.2% of single-step attacks, while its overall detection rate was 29.2% for two-step and 37.5% for three-step cases, even when any flagged sub-step counted as detection.

That does not make prompts or content classifiers useless. It makes them insufficient as the final authority. A stronger deployment should retain a tamper-resistant action history, bind every action to explicit task scope, and re-evaluate the whole planned sequence before consequential operations. File deletion, credential use, software installation, outbound sharing, and permission changes deserve policy checks based on cumulative state, not confidence in the latest message.

Red-team suites should mirror that design. Vary chain length, source type, navigation method, and authorization wording; then score both unsafe outcomes and benign task completion. Test controls separately from agent capability so a navigation failure is not misclassified as a security success.

## Read the result within its limits

StepJack is a preprint and its main evaluation was run once because of API and infrastructure cost. It covered two simulated platforms, 12 adversarial goals, and chains no deeper than three steps. The authors explicitly present these as limitations.

Defenders should treat the reported rates as benchmark evidence, not forecasts for their own environment. The durable finding is the trust failure: an authorized navigation path can carry instructions that were never authorized. Agent governance must preserve that distinction across every reference—and enforce the boundary outside the model itself.
