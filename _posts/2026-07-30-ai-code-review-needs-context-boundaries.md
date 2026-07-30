---
title: "AI Code Review Needs Boundaries Around Its New Context"
subtitle: "GitHub’s expanded code-review context makes integration inventory and least privilege part of review assurance."
description: "GitHub code review can now use agent skills and MCP context, making tool scope, secrets, and attribution essential review controls."
date: 2026-07-30 10:10:35 +0400
layout: post
category: ai-security
tags: [ai-code-review, mcp, software-supply-chain, least-privilege]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-30-ai-code-review-needs-context-boundaries.svg
image_alt: "Abstract repository panels passing through a narrow illuminated gateway into a layered code-review lens"
key_points:
  - "Existing MCP configurations now apply to code review as well as the cloud agent."
  - "Read-only tool calls reduce impact but do not remove context and authorization risk."
  - "Teams should inventory skills, allowlist tools, narrow tokens, and inspect review attribution."
sources:
  - title: "Copilot code review: Agent skills and MCP now generally available"
    publisher: "GitHub Changelog · July 29, 2026"
    url: "https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available/"
  - title: "Configure MCP servers for your repository"
    publisher: "GitHub Docs · accessed July 30, 2026"
    url: "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers"
  - title: "About agent skills"
    publisher: "GitHub Docs · accessed July 30, 2026"
    url: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills"
---

AI-assisted review is becoming less isolated from the systems around it. GitHub announced on July 29 that Copilot code review can now use agent skills and Model Context Protocol (MCP) servers for all eligible paid plans. That can make review more relevant to an organisation’s standards and operational reality. It also means the assurance boundary now includes the instructions, tools, data sources and credentials that shape the reviewer.

The defensive lesson is straightforward: enabling a smarter reviewer is also an integration change. Treat it with the same care as adding a build service or security scanner.

## What changed in the review path

Agent skills let teams place specialised instructions and supporting resources in skill directories, including `.github/skills`, so a review can apply repository-specific standards. MCP connections can supply context from external systems such as issue trackers, documentation platforms and service catalogues.

GitHub says MCP tool calls made by code review are limited to read-only operations. Comments also identify when skills or MCP context contributed to them, giving reviewers a visible provenance signal. Those are useful safeguards: restricting mutation limits direct impact, while attribution helps a human understand why a comment appeared.

The rollout still changes existing assumptions. GitHub says MCP configurations already established for its cloud agent automatically apply to code review, and its GitHub and Playwright MCP servers are enabled by default. A repository may therefore gain a broader review context without a team creating a new configuration specifically for pull requests.

## Read-only is a boundary, not a verdict

Read-only access prevents a review tool from directly changing an external record, but confidentiality and decision quality remain relevant. A tool may be able to retrieve material that was never intended to influence every pull-request review. Over-broad context can also produce convincing but inappropriate recommendations when a policy, issue or service record belongs to another environment or has gone stale.

GitHub’s configuration guidance makes another operational detail explicit: configured MCP tools may be used autonomously without an approval prompt. The documentation recommends allowlisting specific read-only tools rather than enabling every tool with a wildcard. It also confines MCP configuration secrets and variables to names with a `COPILOT_MCP_` prefix, but naming is not a substitute for narrowing the underlying credential.

Skills deserve the same scrutiny. GitHub describes them as folders containing instructions, scripts and resources, and supports project and personal locations across several Copilot surfaces. For defenders, that makes a skill a governed review dependency, not merely helpful prose.

## Build an inventory before trusting the output

Repository administrators should first record every enabled MCP server, the exact tools exposed, the data each tool can retrieve and the identity used to retrieve it. Replace wildcard tool lists with a minimum set. Use fine-grained, read-only credentials scoped to the smallest practical collection of repositories or records, then establish an owner and rotation path for every agent secret.

Next, review skill directories with the same change controls applied to workflow and policy files. Require named ownership, peer review and a clear statement of which repositories or languages a skill covers. Shared personal skills should not silently become the organisation’s standard.

Finally, run a controlled pull request and inspect the review session logs. GitHub’s documentation says those logs show which MCP servers and tools were started and called. Compare that evidence with the approved inventory, and verify that comments carrying skill or MCP attribution are traceable to current, authorised context.

## Keep the human decision point

Context-rich review can connect code to controls that a generic model would miss. It should not turn a generated comment into an automatic gate. Teams still need a human to judge whether the cited standard applies, whether retrieved context is current and whether the recommendation fits the change.

A sensible rollout starts with low-sensitivity repositories, a small tool allowlist and sampled log review. Exceptions and false positives should feed back into the skill or integration configuration. If a repository does not need external context during review, GitHub provides a setting to disable MCP tools for code review while retaining them for the cloud agent.

The strongest control is not simply “read-only.” It is proof that the reviewer read only the right things, under the right identity, for the right pull request.
