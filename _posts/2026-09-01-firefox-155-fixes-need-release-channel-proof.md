---
title: "Firefox 155 Fixes Need Release-Channel Proof"
subtitle: "Mozilla's new security release makes browser version evidence essential across desktop, Android, and ESR fleets."
description: "Firefox 155 and three ESR updates fix high-impact flaws, including sandbox escapes, making channel-aware deployment verification the priority."
date: 2026-09-01 20:11:44 +0400
layout: post
category: defense
tags: [Firefox, browser-security, vulnerability-management, patching]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-01-firefox-155-fixes-need-release-channel-proof.svg
image_alt: "Abstract browser window protected by layered translucent shields across four converging release paths"
key_points:
  - "Mozilla rates the Firefox 155 advisory high and lists ten individually reported high-impact flaws."
  - "Supported ESR branches have separate fixed versions, so one fleet-wide version target is insufficient."
  - "Defenders should verify the running browser version after relaunch and reconcile devices that miss updates."
sources:
  - title: "Security Vulnerabilities fixed in Firefox 155"
    publisher: "Mozilla · September 1, 2026"
    url: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-82/"
  - title: "Security Vulnerabilities fixed in Firefox ESR 115.40"
    publisher: "Mozilla · September 1, 2026"
    url: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-83/"
  - title: "Security Vulnerabilities fixed in Firefox ESR 140.15"
    publisher: "Mozilla · September 1, 2026"
    url: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-84/"
  - title: "Security Vulnerabilities fixed in Firefox ESR 153.2"
    publisher: "Mozilla · September 1, 2026"
    url: "https://www.mozilla.org/en-US/security/advisories/mfsa2026-85/"
---

Mozilla has released Firefox 155 alongside security updates for three Extended Support Release branches. The advisories make the immediate defensive task broader than clicking “update”: teams need to map each managed device to its intended channel, deploy the corresponding fixed build, and prove that the browser actually restarted into that build.

## What Mozilla fixed

Mozilla rates its Firefox 155 advisory high. It lists ten individually reported high-impact vulnerabilities, spanning privilege escalation, use-after-free conditions, sandbox escapes and incorrect boundary handling. Two entries, CVE-2026-84119 and CVE-2026-84121, are described as sandbox escapes caused by use-after-free defects in DOM navigation and DOM security components. Other high-impact entries affect JavaScript garbage collection, audio and video handling, WebGPU, core HTML and layout.

The advisory also groups internally discovered defects under three additional CVEs. Mozilla says some of those bugs showed evidence of memory corruption or another security-relevant defect and could potentially have been exploitable with enough effort. That language describes technical potential, not observed attacks. Mozilla's published advisories do not claim exploitation in the wild, identify victims or document an incident.

Firefox 155 is the fixed release for the standard channel. Firefox for Android is part of that advisory as well: CVE-2026-84117 is a high-impact privilege-escalation issue specific to Android, while CVE-2026-84127 is a moderate information-disclosure issue in Android's WebExtensions component.

## ESR fleets need branch-aware action

Enterprise deployments cannot treat 155 as the only safe destination. Mozilla published separate advisories fixing supported ESR branches at 115.40, 140.15 and 153.2. Their vulnerability sets overlap, but they are not identical.

All three ESR releases include fixes for CVE-2026-84119 and CVE-2026-84121, the two high-impact DOM sandbox escapes. They also address CVE-2026-75874, a high-impact sandbox escape in the Remote Settings Client. Firefox ESR 140.15 and 153.2 contain additional fixes absent from the shorter ESR 115.40 advisory; 153.2, for example, includes the JavaScript garbage-collection, WebGPU and core HTML use-after-free issues also listed for Firefox 155.

This variation is why a report that merely says “Firefox patched” is weak evidence. A valid remediation record needs the device's assigned channel, its pre-update version, the applicable fixed release and its observed post-update version.

## Turn deployment into proof

Start by separating standard Firefox, Android and each ESR branch in endpoint inventory. Include developer workstations, virtual desktops, shared kiosks and servers where a browser may exist outside the ordinary desktop image. Compare the running build—not only the package repository candidate or management policy—with 155, 153.2, 140.15 or 115.40 as appropriate.

Push the update through the supported management path, then account for the restart boundary. A downloaded update does not protect the active browser process. Use device telemetry to confirm the running version after relaunch, and set a deadline for reconciling machines that remain stale because they are offline, update services are unhealthy, users defer restarts or local installations fall outside management.

Avoid collapsing all exceptions into one compliance percentage. Record unsupported builds, unmanaged installations and systems that cannot yet restart separately, with an owner and a time-bound treatment. Where an immediate update is operationally blocked, reduce browser use on that device and restrict exposure until the fixed build is active; compensating controls should remain temporary and explicit.

## Keep the browser baseline measurable

The enduring lesson is not a particular CVE count. Browser risk moves through multiple release channels, while protection arrives only when the intended update becomes the running process. A defensible baseline therefore joins inventory, channel selection, deployment and restart evidence. Firefox 155 and the three ESR releases give teams precise targets; fleet-level proof determines whether those targets have actually been reached.
