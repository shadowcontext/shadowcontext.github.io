---
title: "Prompt-Injection Filters Need Domain Calibration"
subtitle: "New research shows that context-aware filtering works best when defenders tune the security–utility tradeoff for each agent workflow."
description: "New prompt-injection research shows why agent defenses must use query context, test adaptive evasion, and measure lost task utility."
date: 2026-08-08 04:10:32 +0400
layout: post
category: ai-security
tags: [prompt-injection, ai-agents, adversarial-ml, defense]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-08-prompt-injection-filters-need-domain-calibration.svg
image_alt: "Abstract layered document streams passing through a contextual security filter, with an amber malicious strand diverted from a protected agent core"
key_points:
  - "Judge external instructions against both the user request and surrounding content."
  - "Evaluate filters with adaptive attacks and task completion, not detection accuracy alone."
  - "Calibrate prompt-injection defenses separately for each agent workflow."
sources:
  - title: "Robust Context-Aware Detection of Malicious Instructions in Text"
    publisher: "arXiv · August 5, 2026"
    url: "https://arxiv.org/abs/2608.05430"
---

Prompt-injection filtering can fail in two directions: it can let hostile instructions reach an AI agent, or it can remove so much legitimate content that the agent can no longer do useful work. Newly listed research argues that defenders need to measure both failures in the context of the actual task.

The paper introduces Context-Aware Detection, or CAD, a lightweight sentence-level classifier for indirect prompt injection. Its most practical finding is not that one filter wins everywhere. It is that the acceptable balance between security and utility changes markedly across banking, collaboration, travel, software-development, shopping and everyday-agent workflows.

## Context changes whether an instruction is suspicious

Indirect prompt injection hides instructions inside material an agent retrieves, such as a web page, message or tool response. A sentence that looks procedural in isolation may be legitimate for one user request and irrelevant or dangerous for another. Surrounding sentences can also change that interpretation.

CAD therefore evaluates each sentence using three signals: the sentence itself, the user's query and the sentence's contribution to the surrounding response. The design uses a frozen text encoder and a small classifier rather than calling another large language model during each agent run. The researchers describe it as a wrapper that can sit in front of different agent models and remove sentences classified as malicious before the agent processes the content.

Their ablation results reinforce the architectural point. On the more complex AgentDyn benchmark, removing the query or surrounding response context reduced clean task utility. A lower attack-success rate was not automatically better: in some cases it reflected aggressive filtering that also prevented legitimate work. For defenders, that makes the user request part of the security decision, not merely application data passed downstream.

## Adaptive testing exposes the real tradeoff

The researchers evaluated CAD against static prompt injections and adaptive attacks designed to evade defenses. They used AgentDojo and AgentDyn for agent workflows and AutoDojo for adaptive evaluation, testing with three agent models. They measured clean utility, utility while under attack and attack success rate rather than reducing the comparison to classifier accuracy.

CAD was also trained with two kinds of adversarial examples. One perturbed representations in embedding space; the other used language-model paraphrases to produce realizable text variations. The proportion of adversarial data became a tuning control: increasing it could improve resistance, but could also impose a utility cost. The paper reports that paraphrase-based training generally performed somewhat better, while feature-space training still transferred useful robustness to realizable language attacks.

This is an important evaluation pattern for security teams. A detector tested only against a fixed catalogue of obvious injections measures yesterday's wording. An adaptive evaluation asks whether a determined input can preserve its intent while changing how it appears. Yet the test must also record whether the defended agent still completes benign tasks; otherwise blanket rejection can masquerade as security.

## One threshold will not fit every workflow

The strongest operational lesson comes from the suite-level differences. In the paper's banking and Slack tests, adversarial training could reduce attack success with little or no utility loss. In the GitHub suite, stronger adversarial training produced a steep utility penalty for a comparatively modest security gain. The authors consequently recommend domain-dependent tuning rather than a universal setting.

For deployment owners, the calibration unit should be a real workflow with known tools, data sources and consequences. Establish clean-task baselines, introduce representative untrusted content, run adaptive evaluations, and choose thresholds against an explicit risk tolerance. Revisit the setting when tools, models or source types change. High-consequence actions should still require deterministic authorization and confirmation controls; a content filter is one layer, not permission to let the model act freely.

## What the research does not solve

CAD operates at sentence level. The authors note that it cannot isolate a malicious instruction blended into an otherwise benign sentence. Its training data also draws on specific benchmark domains, and the paper's own results show why transfer cannot be assumed. This is a preprint, so the findings should be treated as promising evidence rather than a settled production standard.

Defenders can still use its central discipline now: preserve context, test against adaptation and score security together with useful task completion. Prompt-injection controls should be governed like other detection systems—with deployment-specific validation, measured false positives and defense in depth—not installed as a universal semantic firewall.
