---
title: "Agent Skills Need Trajectory Budgets, Not Just Correct Answers"
subtitle: "New research shows that a static third-party skill can preserve task success while quietly expanding an agent's work and cost."
description: "Skill-based AI agents need route review, invocation limits, and cost telemetry because correct outputs can conceal unnecessary execution detours."
date: 2026-08-13 06:08:58 +0400
layout: post
category: ai-security
tags: [ai-agents, agent-skills, supply-chain, resource-abuse]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-13-agent-skills-need-trajectory-budgets.svg
image_alt: "Abstract teal agent route passing through a guarded boundary while amber loops are contained by luminous budget rings"
key_points:
  - "A correct agent answer does not prove that its execution path was necessary or safe."
  - "Review skill descriptions and instruction bodies as one cross-stage control surface."
  - "Set token, invocation, and transition budgets, then alert on unexplained detours."
sources:
  - title: "Convergent Detour Hijacking: Task-Preserving Resource Amplification in Skill-Based LLM Agents"
    publisher: "arXiv · 12 August 2026"
    url: "https://arxiv.org/abs/2608.12273"
---

An AI agent can return the right answer and still take a manipulated route to get there. New research on skill-based agents shows why defenders must evaluate the execution trajectory—not only the final response—when third-party instructions can shape planning.

## A detour that still reaches the destination

The preprint introduces “convergent detour hijacking,” a resource-amplification technique aimed at agents that use progressive disclosure for skills. In such systems, a short, publisher-controlled description helps the agent decide which skill to load. The full instruction body then influences planning after selection.

The researchers show how one static coordinator skill can exploit both stages without changing model internals, controlling runtime responses, or adding an executable companion. Its description appears relevant enough to be selected alongside legitimate skills. Once loaded, its instructions manufacture plausible prerequisites and verification steps, recruit unnecessary benign skills, and eventually return control to the original task.

That convergence matters. A blatantly broken workflow is easy to notice; a detour that finishes successfully can pass an output-only quality check. The security consequence is primarily availability and cost integrity: more calls, more context, and more processing can accumulate while the user sees an acceptable result.

## What the evaluation found

The authors tested the technique on an isolated deployment of OpenClaw version 2026.5.7, using its default registry of 53 skills. They built 536 multi-skill tasks, reserved 45 for developing coordinator descriptions, and kept 491 as a held-out evaluation set. Clean and injected runs used the same tasks, model settings, and mock backends; the coordinator's presence was the controlled difference.

Across the tested model and session combinations, coordinator hit rates in full agent execution ranged from 78% to 96.6%. For coordinator-selected tasks where both clean and injected runs completed, total token use rose by 49.6% to 80.81% in single-task tests and by 36.54% to 107.12% in multi-turn tests. Every reported configuration also added skill invocations.

Those figures belong to a controlled preprint, not a measurement of production exposure. The paper covers one agent platform, group-matched coordinator skills, and mocked external services. Its independently authored test set was also small: 30 tasks, with the coordinator selected in 10. The finding is therefore a demonstrated failure mode, not evidence that a particular prevalence rate applies across agent ecosystems.

## Review the two control points together

Skill governance often separates discovery metadata from implementation review. This research argues that the separation is itself security-relevant. A description can obtain a place in context while an instruction body turns that foothold into unnecessary work; reviewing either element alone can miss their combined effect.

Before installation, defenders should compare each skill's routing claims with its declared purpose. Broad coordination language deserves scrutiny, particularly when the body imposes dependencies on unrelated skills or describes prerequisite chains that are not inherent to the capability. Approved versions should be pinned, and any change to either the description or body should trigger renewed review.

Testing should use paired runs on representative tasks: one with the proposed skill and one without it. Compare selected skills, invocation sequences, token consumption, cached context, elapsed time, and completion quality. The goal is not to demand one canonical route, but to identify repeated work or cross-skill transitions that lack a user-objective justification.

## Make cost integrity enforceable

Runtime controls should treat resources as permissions. Establish per-task ceilings for tokens, skill invocations, retries, and wall-clock duration, with tighter defaults for newly installed or low-trust skills. A coordinator should not be able to expand its own allowance merely by declaring more checks necessary.

Log why each transition was selected and preserve enough trajectory data to compare the plan with the user's request. Alert when a skill repeatedly recruits capabilities outside its normal domain, revisits completed stages, or consumes sharply more resources than the baseline for similar work. Multi-turn sessions need cumulative budgets so a bounded detour cannot be repeated across turns.

Finally, keep approval gates around consequential actions even when the immediate concern appears to be cost. Unnecessary tool calls enlarge the operational surface as well as the bill. Final-answer correctness remains useful, but it is only one security signal. For extensible agents, defenders also need evidence that the route was proportionate, explainable, and within policy.
