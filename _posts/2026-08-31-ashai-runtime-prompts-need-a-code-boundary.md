---
title: "AshAI Runtime Prompts Need a Code Boundary"
subtitle: "A critical fix shows why AI application frameworks must keep request-derived prompt data outside executable template paths."
description: "AshAI 1.0.0 fixes a critical code-injection flaw by separating runtime prompt content from EEx template evaluation."
date: 2026-08-31 09:09:39 +0400
layout: post
category: ai-security
tags: [ashai, prompt-security, code-injection, patching]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-31-ashai-runtime-prompts-need-a-code-boundary.svg
image_alt: "Abstract teal prompt streams halted at a luminous security boundary before an amber execution core"
key_points:
  - "AshAI versions from 0.1.0 to before 1.0.0 are affected in specific prompt-action deployments."
  - "The risk arises when request-derived prompt content reaches server-side EEx evaluation."
  - "Upgrade to 1.0.0 and verify that runtime prompt data never enters a code-evaluation path."
sources:
  - title: "Remote code execution in `AshAi.Actions.Prompt` in AshAi via EEx evaluation of prompt content built from user input"
    publisher: "Ash Project · 30 August 2026"
    url: "https://github.com/ash-project/ash_ai/security/advisories/GHSA-2g59-hg7m-qc83"
  - title: "v1.0.0"
    publisher: "Ash Project · 30 August 2026"
    url: "https://github.com/ash-project/ash_ai/releases/tag/v1.0.0"
---

AshAI has fixed a critical code-injection vulnerability in its prompt-action handling. The flaw matters beyond one Elixir package because it exposes a dangerous category error in AI application design: text intended for a model must remain data, even when a framework also supports developer-authored templates.

The Ash Project advisory identifies the issue as CVE-2026-77956 and rates it 10.0 under CVSS 4.0. That score describes technical severity, not proof that every installation is exposed. Defenders should establish whether their applications use the affected package, an affected version and the vulnerable data path before deciding operational priority.

## Exposure depends on how prompts are built

The affected range is AshAI 0.1.0 through versions before 1.0.0. According to the advisory, the vulnerable condition arises when an application uses an AshAI prompt action whose prompt content is produced at runtime from untrusted input. The framework passed that content through Elixir's EEx template evaluator, allowing text supplied as prompt data to be interpreted as server-side code.

This is not the same as prompt injection against a language model. Prompt injection attempts to influence model behaviour inside the model interaction. CVE-2026-77956 concerns code evaluation in the application process before the model request. That distinction changes both the potential impact and the evidence defenders need.

The vendor says prompt actions returning a `ReqLLM.Context` do not follow the affected evaluation path. Applications using only fixed, developer-controlled templates also present a different trust condition from applications that compose prompt content from HTTP parameters, messages, uploaded material or other external fields. Inventory therefore needs to reach configuration and code-path level; a package version alone proves presence, not reachability.

## The patch restores a data boundary

AshAI 1.0.0 is the patched version. Its release notes explicitly state that runtime prompt content is no longer evaluated as EEx templates. That is the right security boundary: static templates selected and authored by trusted developers may require template processing, while values arriving during a request should be inserted as data without gaining template syntax or execution semantics.

Teams should upgrade rather than attempt to filter dangerous-looking prompt strings. Deny-lists are a weak control at an interpreter boundary because the parser, not the application, ultimately decides what carries meaning. The robust fix is architectural: untrusted content must not reach an evaluator at all.

The release contains multiple security fixes, so dependency review should account for the full upgrade rather than cherry-picking assumptions from this CVE. Confirm the resolved package in the built artifact and deployed release, not only the version constraint in a source manifest. Lockfiles, cached build layers and long-running nodes can preserve an older component after a repository change.

## Verification should test the invariant

Start by locating every use of AshAI prompt actions and tracing where each prompt value originates. Mark request bodies, chat messages, document text, tool output and retrieved content as untrusted even if another service generated them. Then identify whether any transformation can route those values into EEx or another code-capable renderer.

After upgrading, add a regression test that supplies inert template-like markers as ordinary prompt text and verifies they remain unchanged data. The test should observe the boundary directly: no template expansion, no application-side effect and no evaluation before the model client is invoked. Avoid placing real execution primitives in production tests; a harmless sentinel is enough to validate the property.

Runtime monitoring can provide a second line of evidence. Watch AI-facing application processes for unexpected child processes, file changes or outbound connections, but do not mistake an absence of alerts for proof of safety. The primary closure condition is a patched deployed version plus a verified data flow.

## A reusable lesson for AI frameworks

AI systems combine many languages: application code, templates, prompts, tool schemas and model output. Security failures emerge when content crosses between those languages without an explicit boundary. A prompt can be untrusted even when it looks like prose, and model-generated text remains untrusted when it returns to the application.

Framework maintainers should make safe data insertion the default, reserve executable templating for clearly marked static configuration and document the difference. Application teams should review prompt pipelines the way they review SQL queries or shell wrappers: trace provenance, keep data out of interpreters and test the invariant at the point where meanings could change.
