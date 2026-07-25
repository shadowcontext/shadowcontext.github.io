---
title: "Agent knowledge needs explicit trust signals"
subtitle: "A new open format makes provenance and verification visible, but defenders still have to enforce the boundary."
description: "OKF v0.2 exposes provenance, verification, freshness, lifecycle and attestation signals for knowledge exchanged between AI agents."
date: 2026-07-25 04:09:40 +0400
layout: post
category: ai-security
tags: [ai-agents, data-governance, provenance, trust]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-25-agent-knowledge-needs-explicit-trust-signals.svg
image_alt: "Abstract layered knowledge cards passing through a luminous trust boundary with provenance markers"
key_points:
  - "Agent-written knowledge needs machine-readable provenance, verification and freshness signals."
  - "OKF v0.2 records trust evidence but deliberately does not make access-control decisions."
  - "Defenders should bind high-impact agent actions to explicit policy gates and per-run attestation."
sources:
  - title: "Open Knowledge format v0.2 tackles agentic trust"
    publisher: "Google Cloud · July 25, 2026"
    url: "https://cloud.google.com/blog/products/data-analytics/okf-v0-2-adds-trust-signals/"
---

Knowledge passed from one AI agent to another can look authoritative long after its origin, review status or validity has become unclear. Google Cloud’s Open Knowledge Format (OKF) v0.2, published on July 25, addresses that problem by adding machine-readable trust signals to agent-maintained knowledge.

The release is useful less as a universal answer than as a clear security pattern: make evidence about knowledge visible before an agent relies on it, then enforce separate policy for consequential actions.

## Five questions before trust

OKF represents knowledge as Markdown with YAML front matter. Version 0.2 adds optional fields intended to answer five questions: what produced an item, how it was verified, whether it remains fresh, where it sits in its lifecycle, and whether a reported result was computed through an approved process.

The distinction matters when agents generate and consume large collections without a human reading every item. A polished runbook, metric definition or table description may be syntactically valid while being stale, derived from a weak source or never independently reviewed. Explicit metadata lets a consumer identify those states before loading or acting on the body.

Google’s design separates `generated` from `verified`: the actor that created content is not assumed to be the actor that confirmed it. It also adds `status` and `stale_after`, making deprecated or expired knowledge machine-detectable. Source records can carry authorship, modification and usage details, while individual claims can point back to a source.

## Evidence is not enforcement

The most important security caveat is also explicit in the release. These fields are optional, trust tiers are advisory, and OKF itself does not provide access control. An unverified item remains valid format-wise; it is merely distinguishable from a verified one.

That is a sensible separation of responsibilities, but deployments must not confuse visible trust metadata with a security boundary. A consumer still needs rules such as refusing unverified instructions for production changes, blocking deprecated concepts from new workflows, or requiring human review for financial and identity decisions.

Metadata is also content and should be treated as untrusted at ingestion. A producer can claim a source, verification actor or future freshness date. Defenders therefore need controls around who may write those fields, how identities are resolved, where approvals are logged and whether changes receive review. Version control can expose diffs and history, but it does not prove that a claimed reviewer actually approved the current content.

## Attest the action, not only the definition

OKF v0.2 introduces “Attested Computation” for a narrower problem: confirming that a value was produced using the sanctioned computation. The format can declare an executor, expected receipt fields and an attester. In Google’s example, deterministic code compares the executed query with the approved query and rejects a mismatch.

This creates a useful split between slow governance and runtime assurance. Verification says a definition still matches policy; attestation checks that a particular execution followed it. One cannot replace the other. A recently reviewed definition can still be executed incorrectly, while an old definition can be executed exactly as written and still yield a policy-invalid answer.

Defenders can apply the same pattern beyond analytics. High-impact agent actions should produce receipts containing the selected policy artifact, its version, validated parameters and the result. A deterministic gate should check those receipts before the result reaches another system. The language model should not be the component that certifies its own compliance.

## A practical adoption baseline

Teams experimenting with agent-authored knowledge should first inventory which downstream decisions depend on it. Low-risk search hints may tolerate unverified material; production changes, access decisions and executive reporting should not.

Define accepted producer and verifier identities, require absolute expiry dates for time-sensitive concepts, and make deprecation a blocking state for new use. Keep source references close to the claims they support, and alert when a trusted artifact changes without renewed verification. For computations or actions, record an immutable receipt and validate it with deterministic logic.

OKF v0.2 supplies vocabulary for these controls, not the controls themselves. That boundary is the central lesson: trustworthy agent ecosystems need both legible evidence and an enforcement layer that knows when the evidence is insufficient.
