---
title: "Chrome Follow-Up Fix Resets the Safe-Version Baseline"
subtitle: "Four new high-severity flaws show why browser compliance must follow the latest build, not the major version."
description: "Chrome's second security update in a week fixes four high-severity flaws and resets the desktop version baseline defenders should verify."
date: 2026-07-25 09:10:43 +0400
layout: post
category: defense
tags: [chrome, browser-security, patch-management, endpoint-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-25-chrome-follow-up-fix-resets-the-version-baseline.svg
image_alt: "Abstract browser layers crossing a bright verification threshold as a second security pulse overtakes an earlier update"
key_points:
  - "Google's July 23 desktop update fixes four newly listed high-severity vulnerabilities."
  - "The fixed baseline is 150.0.7871.186 or .187, depending on the desktop platform."
  - "Compliance checks must distinguish the current build from earlier Chrome 150 security releases."
sources:
  - title: "Stable Channel Update for Desktop"
    publisher: "Chrome Releases · July 23, 2026"
    url: "https://chromereleases.googleblog.com/2026/07/stable-channel-update-for-desktop_01320465736.html"
  - title: "CVE-2026-16804 Detail"
    publisher: "National Vulnerability Database · July 23, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2026-16804"
  - title: "Multiples vulnérabilités dans Google Chrome"
    publisher: "CERT-FR · July 24, 2026"
    url: "https://cert.ssi.gouv.fr/avis/CERTFR-2026-AVI-0925/"
---

Google has issued another Chrome 150 security update, only a week after an earlier stable-channel release corrected a separate set of serious flaws. The new release fixes four additional high-severity vulnerabilities and moves the desktop baseline forward again.

For defenders, the key fact is not simply that Chrome 150 is installed. It is whether the running browser has reached the precise fixed build for its platform. A major-version-only rule can now report a vulnerable endpoint as current.

## Four new fixes, one new baseline

Google's July 23 release lists four high-severity vulnerabilities: CVE-2026-16807, an out-of-bounds write in Codecs; CVE-2026-16806, a use-after-free issue in WebMCP; CVE-2026-16805, a use-after-free issue in Blink; and CVE-2026-16804, a use-after-free issue in Input.

The corrected versions are 150.0.7871.186 or .187 for Windows and macOS, depending on the platform rollout, and 150.0.7871.186 for Linux. Google says the update will roll out over the coming days and weeks. CERT-FR separately identifies versions before 150.0.7871.186 on Windows and Linux, and before 150.0.7871.187 on macOS, as affected.

Google does not say in the release notice that any of the four flaws is being exploited. It also keeps detailed bug information restricted while the update reaches users. Those limits matter: the advisory supports prompt updating, but not claims of active attacks or confirmed impact.

The NVD record adds useful scope for CVE-2026-16804. It says a remote attacker who had already compromised Chrome's renderer process could potentially use crafted HTML to escape the sandbox. That precondition should be preserved in risk discussions. The flaw is a possible second step across a security boundary, not a stand-alone claim that visiting any page automatically compromises a device.

## Why major-version compliance is insufficient

Chrome's rapid release cadence makes broad inventory labels deceptively reassuring. Several builds can share the same major version while carrying materially different security properties. An endpoint listed only as “Chrome 150” could be on the new fixed build, an earlier security build, or a still older release.

This follow-up also exposes a common dashboard problem. Device-management systems may record that automatic updates are enabled, that a package was downloaded, or that the major version is approved. None of those states proves the current browser process is using 150.0.7871.186 or .187.

The practical control is a full-version comparison tied to platform. Collect the active version, normalize Windows, macOS and Linux expectations, and test it against the current vendor baseline. Avoid a static rule that remains green after Google advances the minimum safe build.

## What defenders should verify

First, query managed endpoints for the running Chrome version and separate them into three groups: below the fixed build, updated but awaiting relaunch, and confirmed on the current build. This makes remediation measurable and prevents a downloaded update from being counted as active protection.

Keep automatic updates enabled, but review version pins, staged deployment rings, maintenance holds and application-compatibility exceptions. Because Google describes a gradual rollout, some endpoints may not receive the release simultaneously. A controlled software-distribution path can help where enterprise policy permits, but the package should still come through an approved vendor channel.

Set a relaunch deadline with enough warning for users to preserve work. Afterward, verify the process version again rather than relying on task completion. Investigate devices that remain behind, including virtual desktops, shared workstations and machines that rarely restart.

Other Chromium-based browsers require their own vendor checks. Shared upstream code does not guarantee identical release timing or version numbering, so Chrome's fixed build should not be applied blindly to another browser.

## Patch assurance must keep moving

The defensive lesson is cadence, not alarm. A successful rollout last week does not satisfy this week's release. Browser patch assurance needs a continuously updated target, full-build telemetry and evidence that corrected code is running.

Teams should record when the baseline changed, which source established it, and when each endpoint crossed it. That turns “automatic updates are on” into an auditable security outcome—and prevents a familiar major-version label from hiding newly obsolete builds.
