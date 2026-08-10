---
title: "Agent harnesses need persistent-state controls"
subtitle: "New research shows why memory, skills, tools, summaries, and shared artifacts must remain untrusted across agent sessions."
description: "HarnessSafe research reframes agent memory, skills, tools, summaries, and artifacts as persistent security boundaries that require lifecycle testing."
date: 2026-08-10 23:10:10 +0400
layout: post
category: ai-security
tags: [ai-agents, prompt-injection, agent-security, secure-development]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-10-agent-harnesses-need-persistent-state-controls.svg
image_alt: "Abstract editorial illustration of glowing state capsules crossing session boundaries while a segmented security ring contains a delayed amber signal"
key_points:
  - "Agent state can carry untrusted influence into a later, otherwise benign task."
  - "Containment depends on the complete harness, model, permissions, and carrier configuration."
  - "Defenders should test each state lifecycle with observable evidence and cleanup controls."
sources:
  - title: "HarnessSafe: Evaluating Safety Across Persistent Carriers in Agent Harnesses"
    publisher: "arXiv · announced August 10, 2026; submitted August 7, 2026"
    url: "https://arxiv.org/abs/2608.06984"
---

An AI agent can finish one task safely and still leave behind the conditions for a later failure. Memory entries, reusable skills, tool metadata, session summaries, and shared artifacts can preserve untrusted influence after the original input has disappeared.

A preprint announced by arXiv on August 10 treats that delayed influence as a lifecycle defenders can measure. HarnessSafe is early research, not proof that every deployed agent is vulnerable, but its central lesson is operationally useful: persistent state is part of the agent’s security boundary.

## The risk survives the original prompt

The researchers define a persistent-risk lifecycle with five elements: an attacker-influenced entry, a carrier that retains it, a boundary it crosses, a later benign trigger, and an observable violation. That model separates persistent risk from ordinary same-session prompt injection. The dangerous instruction need not remain in the current prompt; its effect may have been transformed into memory, a skill, a summary, or an artifact that a future task trusts.

HarnessSafe contains 328 executable cases across seven carrier families. Those cover memory, reusable skills, tool or Model Context Protocol state, memory-to-skill transformation, subagent delegation, session summaries, and shared artifacts. Each test follows the state across a declared boundary and requires evidence that a later task consumed it.

This is the key defensive shift. Reviewing the latest user message is insufficient when authority-relevant state can be written earlier, transformed, and reloaded later. Security controls must follow provenance across the full write, persistence, retrieval, and action path.

## Endpoint pass rates hide where controls failed

The paper evaluates seven agent-harness configurations and also varies model backends within one harness. The authors report that containment differed by carrier family and by the complete harness-model configuration; no evaluated configuration performed uniformly well across every family. They also found that similar end-to-end attack success rates could conceal different stopping points in the lifecycle.

That distinction matters in production. A chain rejected before untrusted state is stored is not equivalent to one that survives a session boundary and is blocked only at the final action. Both may avoid the tested violation, but the second leaves more residual risk if permissions, tools, or policy change.

HarnessSafe therefore scores the furthest stage supported by execution evidence. It uses tool events, state reads and writes, artifact identity, session lineage, and case-specific oracles rather than accepting the model’s own description of what happened. Workflow failures and unsupported test mappings are reported separately, not counted as safe outcomes.

## Read the results within their limits

The study is a preprint and its results describe the tested configurations, not all agents. The cases are a constructed benchmark rather than an estimate of how often these paths occur in real deployments. Each active case received one selected attack trial, and some runtime details were not consolidated across every configuration.

The permission profile is especially important. The researchers intentionally used the most permissive native non-interactive mode available for each harness to test whether persistent state would be mistaken for authority when action-capable interfaces were reachable. The paper explicitly says those settings should not be read as product defaults. Its cross-harness figures therefore should not become a simplistic product league table.

The defensible conclusion is narrower: changing the harness, model backend, permission mode, carrier, or environment can change where a delayed chain is contained. Assurance belongs to a deployed configuration, not to a model name alone.

## Make persistent state inspectable and reversible

Defenders should inventory every durable carrier an agent can write or consume: project memory, skills, tool descriptions and cached outputs, summaries, delegated results, templates, and handoff files. Record who or what created each item, which source influenced it, when it crossed a session or process boundary, and what later action consumed it.

High-consequence actions should receive fresh authorization from the current task rather than inherit authority from stored content. Treat summaries and generated skills as derived untrusted data, constrain tool permissions by task, and isolate state between projects or trust domains. Cleanup must be testable: removing the suspect carrier should prevent the delayed behavior without depending on the model to disregard it.

Finally, test the lifecycle in stages. Confirm whether untrusted content was encountered, persisted, reloaded, translated into an attempted action, and actually executed. Preserve those traces for regression testing. A binary “safe” result says little about which control worked; lifecycle evidence shows where containment is strong and where a future configuration change could reopen the path.
