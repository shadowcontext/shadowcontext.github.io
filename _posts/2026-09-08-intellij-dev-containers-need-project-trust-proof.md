---
title: "IntelliJ Dev Containers Need Project-Trust Proof"
subtitle: "A new IDE advisory shows why opening code and authorizing host execution must remain separate decisions."
description: "CVE-2026-86504 fixes a missing trust check before IntelliJ builds Dev Containers, making IDE version and workflow verification immediate priorities."
date: 2026-09-08 04:13:52 +0400
layout: post
category: defense
tags: [intellij-idea, dev-containers, developer-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-08-intellij-dev-containers-need-project-trust-proof.svg
image_alt: "Abstract developer workspace with an untrusted amber project stopped at a guarded boundary before reaching a blue host environment"
key_points:
  - "CVE-2026-86504 affects IntelliJ IDEA versions before 2026.2.2 and concerns Dev Container builds."
  - "The missing project-trust confirmation could allow host-level code execution after user interaction."
  - "Defenders should update the IDE and verify that untrusted projects cannot start host-affecting build work without approval."
sources:
  - title: "In JetBrains IntelliJ IDEA before 2026.2.2 missing project-trust confirmation before building a Dev Container allowed host-level code execution"
    publisher: "GitHub Advisory Database · 7 September 2026"
    url: "https://github.com/advisories/GHSA-h5xf-2v4c-pv86"
  - title: "Fixed security issues"
    publisher: "JetBrains · accessed 8 September 2026"
    url: "https://www.jetbrains.com/privacy-security/issues-fixed/"
---

A newly published IntelliJ IDEA advisory puts a precise security boundary around a familiar developer action: opening a project must not silently authorize that project to build a Dev Container on the host. CVE-2026-86504 is a focused vulnerability disclosure, not evidence of exploitation or an organizational breach. Its value for defenders is the control question it exposes: where does passive inspection end and trusted execution begin?

## What the advisory establishes

The GitHub Advisory Database record, published on 7 September, says IntelliJ IDEA versions before 2026.2.2 lacked a project-trust confirmation before building a Dev Container. The stated consequence is host-level code execution. The record rates the issue high severity at CVSS 3.1 score 7.8 and classifies the weakness as inclusion of functionality from an untrusted control sphere.

The scoring describes a local attack vector with low complexity, no privileges required and user interaction required. That combination matters. This is not described as an unauthenticated service reachable across the internet, and the advisory does not establish active exploitation. It concerns what can happen after a person brings an untrusted project into the IDE and a Dev Container build crosses into execution on the workstation.

JetBrains lists resolved security issues on its fixed-issues page, which the CVE record names as the vendor reference. The clear version boundary in the record is IntelliJ IDEA 2026.2.2: versions before it are affected. Teams should use that floor when checking managed installations rather than assuming that an IDE described only as “2026.2” is current enough.

## Separate viewing from building

Repositories are bundles of active configuration as well as source text. A developer may intend to review a pull request or inspect unfamiliar code, while project metadata can define container images, build steps, mounts, environment handling and initialization behavior. The defensive lesson from CVE-2026-86504 is not that every Dev Container is malicious. It is that interpreting a project and authorizing host-affecting automation are different decisions.

Organizations should make that distinction explicit in developer guidance. Unknown or externally supplied projects should begin in a review-only state. Building a container, importing build configuration, starting tasks or enabling project-specific automation should require a separate, visible trust decision. Approval should be based on repository origin and a review of execution-capable configuration, not merely on a familiar project name or file extension.

This also makes provenance operational. Record where a repository came from, whether its revision is expected and who requested the review. For downloaded archives and copied working trees, preserve enough context to avoid turning an unattributed folder into a trusted development workspace.

## Update the real IDE estate

Defenders should inventory IntelliJ IDEA across employee workstations, shared engineering desktops, virtual development machines and disposable review environments. Include installations delivered through the JetBrains Toolbox App, operating-system packages, standalone archives and software-management tools. Multiple copies on one endpoint can leave an older executable available after the preferred installation is updated.

Move affected installations to 2026.2.2 or later through the organization’s supported channel. Then collect evidence from the endpoint: the executable actually launched, its reported version and the user population assigned to it. A downloaded installer or a package-manager success message is weaker evidence than the running build. Where immediate updating is not possible, keep untrusted projects away from the affected IDE and use a separately isolated review environment; this is a risk-reduction measure, not a vendor-stated substitute for the fix.

## Prove the trust boundary

Verification should test behavior without dangerous content. In a controlled lab, open a harmless project marked or treated as untrusted and attempt the normal Dev Container build path. Confirm that the updated IDE requires an explicit trust decision before build activity can affect the host, and that declining leaves the project available only to the extent intended by policy. Repeat the check after configuration import, IDE restart and project reopening.

Review host exposure around development containers as a second boundary. Avoid unnecessary sensitive-directory mounts, broadly available credentials and privileged container settings. These controls do not repair the missing confirmation, but they reduce the consequence of any future failure in project trust handling.

Finally, retain the version and test result with the remediation record. CVE-2026-86504 is a reminder that a secure developer workflow needs evidence for both halves of the decision: the code may be inspected, but execution must wait for informed authorization.
