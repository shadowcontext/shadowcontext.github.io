---
title: "Dependabot Adds a Three-Day Buffer for Routine Version Updates"
subtitle: "The new default creates review time for fresh releases without delaying known security fixes."
description: "Dependabot now delays routine version updates by three days, giving new releases time to earn scrutiny while security updates remain immediate."
date: 2026-07-23 22:09:44 +0400
layout: post
category: defense
tags: [supply-chain-security, dependabot, dependency-management, devsecops]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-23-dependency-cooldown-adds-supply-chain-friction.svg
image_alt: "Abstract software release capsules crossing a three-stage amber buffer while a fractured red capsule is diverted from a protected blue pipeline"
key_points:
  - "Dependabot now waits three days before proposing routine version updates by default."
  - "The delay does not apply to security updates for known vulnerabilities."
  - "Teams should pair cooldowns with lockfiles, scoped CI tokens, and human review."
sources:
  - title: "The case for a cooldown: Why Dependabot now waits before issuing version updates"
    publisher: "GitHub Blog · July 23, 2026"
    url: "https://github.blog/security/supply-chain-security/the-case-for-a-cooldown-why-dependabot-now-waits-before-issuing-version-updates/"
  - title: "Dependabot options reference"
    publisher: "GitHub Docs · accessed July 23, 2026"
    url: "https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference"
---

GitHub has changed the default timing of Dependabot version updates. Newly published releases now wait at least three days before Dependabot considers them for a routine version-update pull request, even when a repository has not explicitly configured a cooldown.

The change turns time into a supply-chain control. It gives maintainers, registries, researchers and scanners a short opportunity to examine a release before automation brings it closer to a build. It is useful friction, but only for one narrow class of risk.

## What changed—and what did not

GitHub says the three-day default applies to Dependabot version updates: the pull requests that keep dependencies current as new releases appear. Its documentation confirms that a release inside the cooldown window is skipped until the delay ends, after which normal update behavior resumes.

Security updates follow a different path. When a known vulnerability affects a dependency, Dependabot security updates are not subject to this default delay. That separation is the most important operational detail. A team should not interpret the new buffer as permission to hold a publicly available fix for three days.

Repositories that already define a `cooldown` block in `dependabot.yml` retain control over the timing. The documented options allow a default duration and, for supported ecosystems, different periods for major, minor and patch releases. Include and exclude lists can further narrow where the delay applies. GitHub’s reference lists broad package-manager coverage, including npm, Maven, pip, NuGet, Cargo, Docker, GitHub Actions and Terraform.

## Why a quiet period helps

Routine update automation optimizes for freshness. That is normally valuable, but the newest release is also the release with the least observation time. A pull request opened minutes after publication can move unreviewed code toward continuous integration before maintainers or ecosystem services have had time to flag a problem.

A cooldown changes the decision from “is a newer version available?” to “has this version remained available and unchallenged for a minimum period?” It does not prove that a release is trustworthy. It simply prevents speed alone from deciding when unfamiliar code enters the review queue.

That distinction matters for defenders. The delay can reduce exposure to short-lived malicious or defective releases that are quickly withdrawn. It is less useful against a harmful change that remains undetected for weeks, a trusted maintainer acting improperly, or a weakness introduced through a build system rather than the published package. Time can accumulate evidence; it cannot establish provenance by itself.

## Review the effective policy

Engineering teams should first identify which repositories use Dependabot version updates and whether local configuration overrides the new default. Record the effective cooldown by ecosystem, not merely the presence of a configuration file. An explicit value, an exclusion rule or separate update blocks can produce different behavior across one repository.

Then test the boundary between routine and security updates. In a non-production repository, confirm that an ordinary newly released dependency is deferred while a simulated or test security-update workflow still follows the expected urgent lane. The goal is to verify scheduling and review behavior without introducing a vulnerable package.

Teams with internal packages may choose different delays from public registries, but exceptions should be deliberate and owned. A shorter window may be reasonable where release provenance and build controls are strong. A longer window may suit low-urgency dependencies, provided it does not create an expanding maintenance backlog. Measure update age, failed builds and exception volume so that added caution does not quietly become permanent drift.

## Keep the layers around the delay

GitHub describes the cooldown as defense in depth, and that is the right framing. Keep dependency lockfiles under review, restrict install-time scripts where workflows permit, scope CI credentials to the minimum required access, and require meaningful review before automated changes merge. Build jobs handling external dependencies should not receive broad secrets merely because the update originated from a trusted bot.

Release integrity checks and dependency review remain important after the three days pass. Teams should retain evidence of the resolved package version, source registry, lockfile change and test outcome. High-impact updates deserve review of maintainer notes and unexpected transitive changes, not only a green build.

The practical gain is a safer default, not a guarantee. Used well, the cooldown separates routine freshness from urgent remediation and creates a small inspection window before new code advances. Defenders should preserve that separation, tune it with evidence and ensure the waiting period ends in verification rather than automatic trust.
