---
title: "Position-Independent AI Caches Need Trust Boundaries"
subtitle: "New research shows that reusing hidden model state across requests can carry attacker-shaped context into an otherwise clean prompt."
description: "HijackKV research finds a cross-request risk in position-independent LLM caching, making cache provenance and isolation security controls."
date: 2026-07-23 18:10:25 +0400
layout: post
category: ai-security
tags: [llm-security, ai-infrastructure, cache-security, prompt-injection]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-23-kv-cache-reuse-needs-trust-boundaries.svg
image_alt: "Abstract field of cyan memory tiles separated by a luminous boundary, with one magenta shadow contained inside a cache layer"
key_points:
  - "Position-independent KV reuse can preserve hidden context that is absent from the later prompt."
  - "The researchers report a 94% average single-attempt success rate in their evaluated attack."
  - "Defenders should isolate reusable model state by tenant and bind cache entries to trusted provenance."
sources:
  - title: "HijackKV: New Threat in Position-Independent KV Cache Reuse"
    publisher: "arXiv · announced 23 July 2026"
    url: "https://arxiv.org/abs/2607.19957"
---

An efficiency feature in emerging AI-serving systems may create a security boundary that prompt inspection cannot see. New research accepted for USENIX Security 2026 finds that position-independent reuse of large language model key-value caches can carry attacker-shaped context into a later request even when that request contains no attacker-controlled text.

The work is a research result, not evidence that every commercial AI service is affected. Its immediate lesson is nevertheless operational: reusable model state must be treated as security-sensitive data, with provenance, isolation and lifecycle controls comparable to other shared caches.

## What the researchers found

Key-value, or KV, caching stores intermediate attention state so a model does not have to recompute previously processed tokens. Conventional prefix caching reuses that state only when requests share the same tokens in the same leading position. Position-independent designs seek more cache hits by reusing an identical text chunk wherever it appears in a sequence.

The HijackKV researchers identify a mismatch in that design. A cache lookup may match the visible tokens in a benign chunk, while the stored KV state still reflects the context in which that chunk was originally processed. Their attack optimizes an attacker-controlled prefix so the hidden state associated with a later, unchanged chunk encodes the attacker's objective. If a victim request subsequently reuses that entry, model behavior can be altered without malicious text appearing in the victim's input.

Across the authors' experiments, HijackKV achieved a reported 94% average success rate in a single attempt. They also report effectiveness when cache-hit probability fell to 10%, when half of cache entries were recomputed, across multi-turn interactions and in black-box transfer tests between models. Those figures describe the paper's evaluated systems and conditions; they should not be generalized into a prevalence estimate for deployed services.

## Why prompt-only controls miss the boundary

Many AI security controls reason about text: scan the user prompt, label retrieved documents, filter tool output, or inspect the final response. HijackKV exposes a different layer. The influential object is an internal numerical representation created during inference and later retrieved by infrastructure.

That makes a “clean prompt” an incomplete security claim. If model state can cross requests, the effective input includes the cache entry, its generating context and the policy that decided it was reusable. Logging only visible tokens may therefore omit the state transition that explains an unexpected response.

The issue is specifically about position-independent reuse as studied by the authors. Ordinary exact-prefix caching should not be described as vulnerable on the basis of this paper alone. Defenders first need to establish which caching design their serving stack actually uses, whether entries cross user or tenant boundaries, and whether retrieved content or agent memory can seed reusable state.

## Controls should follow the cached state

For operators, the safest near-term posture is to place position-independent cache reuse behind a feature inventory and threat review. Cache entries should be partitioned by tenant and trust domain unless a provider can demonstrate that cross-domain reuse is safe. Authentication context, model and tokenizer versions, system-policy version, source provenance and relevant prompt lineage should be considered when deriving or validating a cache key.

These are defensive design recommendations derived from the research, not mitigations claimed to be universally sufficient by the paper. A robust design may also need integrity-protected metadata, bounded retention and a reliable way to invalidate entries when policy, model weights or trusted context changes. High-impact workflows—agents that can call tools, access private retrieval stores or authorize transactions—deserve the strictest separation.

Testing must exercise sequences, not isolated prompts. A security test should populate the cache from one trust context, issue a later request from another, and compare behavior with forced recomputation. Teams should record cache hits and provenance decisions in protected telemetry so anomalous outputs can be traced without exposing sensitive prompt content.

## Efficiency changes require security review

Position-independent reuse is attractive because it can reduce repeated computation for recurring documents and prompt fragments. HijackKV shows why optimization changes at the inference layer cannot be treated as performance-only engineering.

Before enabling such reuse, AI platform owners should require a documented trust model: who can create an entry, who can consume it, what context it encodes, and how it is retired. If those questions cannot be answered, cross-request reuse should remain disabled for sensitive workloads.

The broader lesson is concise. In an LLM system, hidden state is still state. When infrastructure moves it across requests to save time, security controls must move with it.
