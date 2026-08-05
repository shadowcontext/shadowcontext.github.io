---
title: "Agent Workflows Need Unforgeable Authorization"
subtitle: "New research shows why a trusted bot identity must not become a bridge from public input to privileged automation."
description: "Agent-to-agent workflow research shows why CI authorization must rely on unforgeable signals, scoped identities, and verified human approval."
date: 2026-08-05 08:10:55 +0400
layout: post
category: ai-security
tags: [agentic-security, cicd-security, identity-security, prompt-injection]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-05-agent-workflows-need-unforgeable-authorization.svg
image_alt: "Abstract pair of AI workflow nodes separated by a luminous authorization boundary that blocks untrusted input ribbons"
key_points:
  - "A public-facing agent could emit a command that a privileged workflow accepted because the bot held a trusted repository identity."
  - "Google removed three affected workflows; the public record does not establish in-the-wild exploitation or a compromised package release."
  - "Use separate identities, narrow credentials, and authorization signals that untrusted text cannot manufacture."
sources:
  - title: "I'll Just Call You: Agent-to-Agent Privilege Boundary Failures in CI/CD on Google's ADK Repository"
    publisher: "Pillar Security · 3 August 2026"
    url: "https://www.pillar.security/blog/ill-just-call-you-agent-to-agent-privilege-boundary-failures-in-ci-cd-on-googles-adk-repository"
  - title: "fix: remove the issue/PR triage and fix agent workflows"
    publisher: "Google ADK Python · 21 July 2026"
    url: "https://github.com/google/adk-python/commit/66730e9d87915a9371b10ecf3ae9a0c37c4aba04"
  - title: "Google Deletes 3 ADK AI Workflows After Malicious GitHub Issue Could Trigger Privileged Agent"
    publisher: "The Hacker News · 4 August 2026"
    url: "https://thehackernews.com/2026/08/google-deletes-3-adk-ai-workflows-after.html"
---

New research into agentic automation in Google's Agent Development Kit Python repository exposes a subtle authorization failure: a low-trust agent did not need privileged credentials of its own if it could persuade a trusted bot to invoke a more powerful workflow.

The finding is useful beyond one repository. It shows why security teams must threat-model the handoffs between agents, not only the tools and permissions assigned to each agent in isolation.

## What the research establishes

Pillar Security's disclosure, published on 3 August, describes two related workflow chains in the `google/adk-python` repository. Public issue or pull-request content could be processed by a triage agent. Because the account posting the agent's output was treated as a repository collaborator, output influenced by untrusted text could satisfy a gate intended for trusted users and trigger another agent with greater authority.

The researchers also examined a later pair of issue-analysis and issue-fixing workflows. Their controlled testing showed that an unprivileged issue author could influence the first agent's output so that it called the privileged fixer. The second workflow combined code-writing capability with repository and cloud credentials, creating a path to runner code execution and credential exposure in the research environment.

Important boundaries remain. The disclosure says Google hardened the repository and later removed the affected workflows. The Hacker News reported that the evidence does not identify exploitation in the wild or a compromised ADK release. The distributed Python package was not identified as the vulnerable component; the subject is repository automation.

## Identity is not proof of intent

Traditional workflow gates often ask a simple question: did this comment or command come from an owner, member or collaborator? That works only when the trusted identity is reliably controlled by a person or a process that cannot be steered by lower-trust input.

An agent changes that assumption. If it reads public issues and can post through a collaborator account, its identity remains trusted even when its words have been shaped by an outsider. A downstream workflow that checks only the author sees a valid principal but misses the provenance of the requested action.

This is a confused-deputy problem expressed through natural language. Prompt filtering alone cannot repair it, because the unsafe condition is architectural: one component can manufacture the exact signal another component treats as authorization.

## Build a boundary that text cannot cross

Start by mapping every agent-to-agent transition. Record what event triggers it, who can influence the event, which identity appears at the boundary, and what credentials, tools, networks and write permissions become available after the transition. Public issues, pull requests, tickets and chat messages should remain untrusted even after an agent summarizes or reposts them.

Separate bot identities by role and trust level. A public triage agent should not share a human collaborator identity, long-lived personal access token or signing authority with a code-changing agent. Give each workflow a dedicated, auditable identity and short-lived credentials limited to the smallest required scope.

Authorization should come through a channel the model cannot create by emitting text. Examples include an environment approval, a protected workflow dispatch tied to a verified reviewer, or a server-side policy decision bound to the reviewed revision. Re-check authorization at execution time; do not let a comment written earlier act as a durable bearer token.

## Verify the whole chain

Google's remediation commit removed `issue-analyze.yml`, `issue-fix.yml` and `pr-analyze.yml`, stating that they processed untrusted issue and pull-request content while holding broad repository credentials. That is direct remediation evidence, but other organizations need tests for their own compositions.

Use harmless adversarial fixtures to confirm that public content cannot cause a privileged dispatch, alter approval state or reach secrets. Review branch protection, required human approval and separation of duties as independent controls, then verify that agent output cannot impersonate any of those decisions.

The durable lesson is that a trusted agent identity proves who posted an action, not why the action was posted. Agentic CI/CD needs provenance-aware authorization: every handoff must preserve the trust level of its original input and require a fresh, unforgeable decision before authority increases.
