---
title: "Agent Audit Records Need Platform Proof"
subtitle: "New research shows why a signed action log is stronger when it is bound to fresh evidence about the runtime that produced it."
description: "New AI-agent attestation research turns runtime state, action evidence, and freshness into one verification problem for defenders."
date: 2026-08-04 12:12:40 +0400
layout: post
category: ai-security
tags: [ai-agents, attestation, audit-logging, runtime-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-04-agent-audit-records-need-platform-proof.svg
image_alt: "Abstract signed action fragments and hardware measurement rings converging inside a luminous verification prism"
key_points:
  - "A signed agent record proves possession of a key, not the integrity of the runtime."
  - "Bind action evidence to independently appraised platform evidence inside the same freshness window."
  - "Treat authorization, platform state, and evidence freshness as separate deployment decisions."
sources:
  - title: "Hardware-rooted attestation for AI-agent evidence: composing IETF RATS with action evidence packages"
    publisher: "arXiv · 3 August 2026"
    url: "https://arxiv.org/abs/2608.00801"
  - title: "Hardware-rooted attestation for AI-agent evidence: composing IETF RATS with action evidence packages"
    publisher: "Tyche Institute · 17 July 2026"
    url: "https://tyche.institute/publications/hardware-rooted-attestation/"
  - title: "Composing Application-Layer Action Evidence with Remote Attestation Procedures"
    publisher: "IETF Internet-Draft · 16 July 2026"
    url: "https://www.ietf.org/archive/id/draft-sokolov-rats-aep-composition-03.html"
  - title: "Remote ATtestation procedureS (RATS) Architecture"
    publisher: "RFC Editor · January 2023"
    url: "https://www.rfc-editor.org/rfc/rfc9334.html"
---

A signed record of an AI agent's action can show that a particular key produced the record. It cannot, by itself, show that the software holding that key was the approved runtime, running in an acceptable state, when the action occurred.

A technical note newly listed by arXiv proposes joining those two questions. It binds an application-level record of an agent action to independently appraised platform evidence. For defenders deploying agents with consequential tools, the idea turns auditability from a logging feature into a runtime verification problem.

## A signature does not describe the signer

The note defines an action evidence package as a signed, append-only record of an action, the authority behind it and the outcome. Chaining makes later alteration detectable. The weakness is structural: the same software stack that performs the action also writes the account of what happened.

That means a valid signature proves control of a signing key, not the identity or integrity of the executing workload. If a runtime is misconfigured, replaced or operating outside its approved measurement, it may still hold the expected key and create a well-formed record.

The proposed composition uses the IETF Remote ATtestation procedureS architecture to add an independent appraisal. RFC 9334 separates the attester that produces evidence, the verifier that evaluates it and the relying party that decides whether to trust the result. The draft places the agent's action record beside platform evidence, such as a measured-state quote, so a verifier can consider both.

## The binding is the security property

Merely storing two records next to each other is insufficient. The action outcome must be cryptographically linked to fresh platform evidence. Otherwise, an operator could pair a legitimate platform quote with a different or later action record.

The research note reports a feasibility exercise using an emulated software TPM and the open-source Veraison verifier. The action outcome digest was measured into a platform register and covered by a signed quote. The verifier returned an affirming result for the expected state, a contraindicated result after the measured outcome changed, and rejected a quote whose signed data had been altered.

Those results establish that the binding can be checked in the experiment; they do not establish a hardware guarantee. The author explicitly used software emulation, and the associated IETF document is an individual Internet-Draft, not an adopted standard. Production assurance would still depend on real hardware evidence, protected attestation keys, trustworthy reference values and an independently governed verifier.

## Fresh evidence needs an enforced clock

The work also exposes a less obvious implementation trap: carrying a nonce does not prove that a verifier checked it. In the tested reference path, the platform quote contained the session nonce, but the appraisal compared the signature and platform measurement without comparing that nonce to the expected challenge. Freshness therefore had to be enforced separately by the application.

This distinction matters because an old, correctly signed quote can accurately describe a past approved state while saying nothing about the runtime now. RFC 9334 provides several freshness approaches, including synchronized timestamps, nonces and epoch identifiers. A deployment must choose one, define its validity window and test rejection of stale or replayed evidence end to end.

Authorization should remain a separate axis. An attested platform can still attempt an action outside the agent's delegated scope, while an authorized action can come from a contested or expired platform state. Collapsing those outcomes into one pass/fail flag hides the reason a request should be stopped.

## What defenders should require

Start with the decision that consumes the evidence. A payment gateway, administrative API or change controller should accept an agent action only when the authorization is current, the platform appraisal satisfies policy and the evidence is fresh. Log each verdict separately so investigators can distinguish a scope failure from an integrity or replay failure.

Define exactly which runtime artifacts are measured. A generic boot measurement is not proof of a specific agent build, model, tool policy or configuration unless those elements are included in the attested state. Version the reference values and make their approval path auditable.

Finally, test negative cases before relying on the design: change the recorded outcome, present an unexpected runtime measurement, replay valid old evidence and revoke the agent's authority. The important control is not that an audit package exists. It is that a relying system refuses an action when any part of the proof no longer matches reality.
