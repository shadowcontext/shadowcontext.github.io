---
title: "SIM command paths need an explicit device boundary"
subtitle: "New device testing shows why defenders must inventory and constrain commands that cross from a SIM into phones and connected equipment."
description: "WOOT 2026 research found SIM-originated AT-command exposure in 9 of 26 tested devices, making interface minimization and device-level proof essential."
date: 2026-08-10 18:09:50 +0400
layout: post
category: defense
tags: [mobile-security, iot-security, sim-security, attack-surface]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-10-sim-command-paths-need-an-explicit-device-boundary.svg
image_alt: "Abstract editorial illustration of a SIM-like chip sending signal paths toward phone and IoT forms, with a luminous security boundary filtering the connection"
key_points:
  - "Researchers found a SIM-originated AT interface in 9 of 26 tested devices."
  - "The exposed path produced four vulnerabilities across phones and IoT equipment."
  - "Defenders should inventory, minimize, and test every SIM-to-device command boundary."
sources:
  - title: "CATana: On the Dangers of SIM-Originating AT Commands"
    publisher: "USENIX Association · August 10, 2026"
    url: "https://www.usenix.org/conference/woot26/presentation/lisowski"
---

A SIM is normally treated as an identity and connectivity component, not as a source of privileged device instructions. Research made public at WOOT 2026 on August 10 shows why that assumption needs testing: some phones and connected devices accept SIM-originated requests to execute AT commands, creating a control path that may reach sensitive functions.

## What the research establishes

The University of Birmingham and Fuzzware researchers examined the `RUN AT` proactive command. In this mechanism, a SIM asks the mobile equipment—the phone, modem or connected device hosting it—to execute a specified AT command. The result is effectively an AT-command interface that originates on the SIM side of the trust boundary.

Using their CATana analysis toolkit, the researchers surveyed 26 devices: 18 smartphones and eight Internet of Things devices. Nine exposed the SIM AT interface, and the work led to four vulnerabilities. Their published case studies include command execution, arbitrary file reading, forced fallback to 2G connectivity and denial of service.

Those findings do not mean every SIM-equipped device is vulnerable, nor does the public abstract identify every affected model or software version. They establish a narrower but important fact: a feature with substantial authority remains reachable in a meaningful subset of tested devices. Defenders should therefore verify behavior for their own hardware and firmware rather than extrapolate from a brand name or device category.

## Why this is an interface problem

AT commands began as a way to control modems, but modern implementations can expose far more than basic connection management. The security issue is not the command language by itself. It is the decision to let one component request sensitive actions from another without sufficiently narrow policy around which requests are accepted and what authority they receive.

This matters especially for IoT fleets. Cellular routers, trackers, industrial gateways and other embedded systems may remain deployed for years, use customized modem firmware and receive less application-layer scrutiny than smartphones. A device inventory can record the operating system and radio module yet still miss the SIM-to-equipment command path between them.

The research also separates network-layer controls from device-layer assurance. Private access-point names, traffic filtering and application authentication can reduce other risks, but they do not prove that mobile equipment rejects an unsafe command arriving from its SIM interface. That proof has to come from the device design, configuration and validation process.

## A practical defensive review

Start by identifying products that contain removable SIMs, eSIMs or integrated cellular modules, including equipment owned by operational teams rather than central IT. Record the device model, modem or baseband component, firmware version, carrier profile and responsible owner. Ask suppliers directly whether `RUN AT` or an equivalent SIM-originated command mechanism is implemented, enabled and restricted.

For new procurements, require a documented command allowlist, least-privilege execution, negative security testing and a supported way to disable unnecessary proactive-command features. The researchers explicitly emphasize hardening, deprecating or disabling the SIM AT interface. Where a supplier provides an update or configuration control, test it on representative hardware before a fleet rollout and retain evidence that disallowed commands are rejected.

Existing fleets need proportionate containment while answers are pending. Limit the authority of the host services that interact with the modem, protect physical and remote management paths, and monitor for unexplained radio-mode changes, device restarts or loss of service. These signals are not proof of this issue, but they can reveal behavior that deserves device-level investigation. Avoid swapping SIM profiles or modifying production modem settings without vendor guidance; availability and emergency communications may depend on them.

## The lesson for connected-device assurance

Security reviews often stop at visible interfaces: the application, management portal, Bluetooth service or network socket. CATana highlights a quieter boundary inside the product, where a small identity component can become a source of commands.

The durable response is not a one-time scan for the four reported vulnerabilities. It is to make every cross-component command path explicit, reduce it to necessary functions and test rejected behavior as carefully as accepted behavior. For SIM-equipped fleets, “connected securely” should include proof of what the SIM is—and is not—allowed to tell the device to do.
