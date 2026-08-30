---
title: "Skyvern Prompt Fix Shows Why One Safe Render Is the Boundary"
subtitle: "CVE-2026-82447 turns a second template pass into a lesson for every data-driven AI workflow."
description: "CVE-2026-82447 shows why AI workflow inputs must remain data through one controlled template-rendering path, with version and runtime proof."
date: 2026-08-30 04:09:53 +0400
layout: post
category: ai-security
tags: [ai-agents, template-security, sandboxing, workflow-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-30-skyvern-prompts-need-one-safe-rendering-path.svg
image_alt: "Abstract violet prompt ribbons passing once through a luminous cyan safety boundary while a second unsafe loop dissolves above"
key_points:
  - "CVE-2026-82447 affects Skyvern versions from 0.2.1 through versions before 1.0.45."
  - "The flaw arose because prompt content crossed a sandboxed render and then an unsandboxed second render."
  - "Defenders should upgrade, prove the running version, and map every later interpretation stage."
sources:
  - title: "Skyvern before 1.0.45 Sandbox Escape via TextPromptBlock"
    publisher: "CVE Program · August 29, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82447.json"
  - title: "fix(SKY-11793): remove non-sandboxed second render in TextPromptBlock (SSTI) (#7137)"
    publisher: "Skyvern · July 6, 2026"
    url: "https://github.com/Skyvern-AI/skyvern/commit/d723de621d5b3a340f3cc4d5b46bfe40a9a3124e"
  - title: "skyvern 1.0.45"
    publisher: "Python Package Index · July 7, 2026"
    url: "https://pypi.org/project/skyvern/1.0.45/"
---

A newly published vulnerability record gives AI workflow teams a precise warning about “safe” processing: a protected first step does not help if the same content is interpreted again by a less restrictive component. CVE-2026-82447 describes that failure in Skyvern’s TextPromptBlock. The affected range starts at 0.2.1 and ends before 1.0.45, which contains the fix.

## The second render crossed the safety boundary

The [CVE record](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/82xxx/CVE-2026-82447.json), published on August 29, says TextPromptBlock rendered prompts twice: first through a sandboxed Jinja environment and then through an unsandboxed environment. Workflow parameters or output from an earlier block could therefore be treated as template instructions during the later pass instead of remaining literal data. The record says successful abuse could run code with the server process’s privileges.

That is a high-impact condition, but the prerequisites matter. The CVE assigns a CVSS 4.0 score of 8.7 and describes a network path requiring low privileges, low complexity and no separate user interaction. It does not report exploitation in the wild. Defenders should use the score to prioritize affected deployments, not present it as evidence that any deployment has been compromised.

The broader lesson is about data lineage. AI workflows routinely combine operator-authored prompts, user inputs, browser-derived content and upstream block output. A value can pass validation at one stage yet become dangerous when another stage changes its meaning. Calling the first renderer a sandbox is therefore incomplete assurance unless every subsequent consumer preserves the result as data.

## The patch removes an interpreter, not just a pattern

Skyvern’s [patch commit](https://github.com/Skyvern-AI/skyvern/commit/d723de621d5b3a340f3cc4d5b46bfe40a9a3124e) states that it removes the non-sandboxed second render. The accompanying change keeps parameter values literal after the controlled rendering step and adds tests around the TextPromptBlock path. This is a stronger design response than trying to identify and block a list of suspicious template expressions: it eliminates the later interpretation boundary that made those expressions meaningful.

The CVE record identifies versions from 0.2.1 up to, but not including, 1.0.45 as affected. PyPI records [Skyvern 1.0.45](https://pypi.org/project/skyvern/1.0.45/) as released on July 7 using trusted publishing, and provides hashes and provenance for its source and wheel artifacts. The CVE’s later publication date explains why a fix may already exist even where vulnerability feeds only began alerting teams this weekend.

Version 1.0.45 should be treated as the minimum security baseline, not the preferred destination. Later releases exist. Operators should move to a currently supported release compatible with their deployment, using the vendor’s normal upgrade path, rather than deliberately pinning to the oldest fixed build.

## Prove the whole prompt path is safe

Begin with inventory. Identify self-hosted Skyvern services, development instances, containers, Python environments and derivative images. Resolve the effective package version inside the running workload; a changed requirements file, rebuilt base image or updated registry tag does not prove that the active process contains the fix. Preserve the deployed digest or package evidence after rollout.

Next, map who can create or change workflows and who can supply parameters to them. Review every TextPromptBlock that consumes externally influenced values or output from earlier blocks. Until upgrades are complete, restrict workflow-authoring and execution access, reduce network reachability, and avoid routing untrusted data into affected prompt paths. These are exposure controls, not substitutes for the fixed software.

Finally, test the architecture rather than reproducing an exploit. Use benign marker strings containing template-like characters and confirm they remain unchanged after each transformation. Trace prompts through retries, logging, schema-repair paths and downstream integrations, because any later renderer can recreate the same class of boundary failure. Alert on unexpected workflow edits and privilege changes, and run the service with only the filesystem, network and secret access its intended tasks require.

CVE-2026-82447 is ultimately a one-path rule: render controlled templates once, keep inserted values literal, and make later interpretation an explicit, reviewable exception. In agentic systems, the security boundary is not the component named “sandbox”; it is the complete chain from input to action.
