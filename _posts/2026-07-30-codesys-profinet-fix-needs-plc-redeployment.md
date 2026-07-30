---
title: "CODESYS PROFINET Fix Needs PLC Redeployment"
subtitle: "Updating the engineering package is only the first step; existing controller projects must carry the repaired stack into production."
description: "A CODESYS PROFINET flaw can stop PLC applications; defenders must update the add-on, refresh each project, redeploy, and verify recovery."
date: 2026-07-30 14:13:02 +0400
layout: post
category: defense
tags: [ot-security, plc-security, profinet, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-30-codesys-profinet-fix-needs-plc-redeployment.svg
image_alt: "Abstract industrial controller core protected by layered teal shields as a distorted network pulse is contained at its edge"
key_points:
  - "CVE-2026-35226 affects CODESYS PROFINET versions from 4.4.0.0 up to, but not including, 4.8.0.0."
  - "An unauthenticated attacker on the same network segment can stop an affected PLC application."
  - "The fix requires version 4.8.0.0, a device-tree update, and a fresh application download to the PLC."
sources:
  - title: "CODESYS PROFINET Controller - Out-of-bounds Write"
    publisher: "CERT@VDE · 29 July 2026"
    url: "https://certvde.com/en/advisories/VDE-2026-041/"
---

A newly published CODESYS advisory turns a familiar patching problem into an operational technology problem: the repaired software must move from the engineering environment into the running controller project. CVE-2026-35226 can let an unauthenticated actor on the same network segment stop an affected PLC application, making availability—not remote code execution—the central risk.

This is a vulnerability advisory, not a report of an organizational compromise. Its most useful lesson is about deployment evidence: installing a fixed engineering component does not prove that the protocol stack executing on a PLC has changed.

## What the advisory establishes

CERT@VDE says the flaw is an out-of-bounds write in the CODESYS PROFINET Controller. CODESYS PROFINET is an add-on for the CODESYS Development System. When a project includes a PROFINET Controller configuration, the protocol stack is downloaded to a CODESYS Control runtime and executes there.

Malformed PROFINET communication data can trigger the memory error. The CODESYS Control runtime handles the resulting exception and performs a controlled stop of the affected PLC application. The application remains stopped until it is restarted. The vendor does not consider remote code execution feasible because execution flow remains controlled.

The affected range begins with CODESYS PROFINET 4.4.0.0 and ends before 4.8.0.0. The advisory assigns CVE-2026-35226 a CVSS 3.1 score of 6.5 and an adjacent-network attack vector: the actor needs access to the same network segment, but does not need privileges or user interaction. Only projects that include a PROFINET Controller configuration are affected.

Those boundaries should shape triage. A broad inventory of every CODESYS installation will overstate exposure, while checking only engineering workstations will miss where the vulnerable stack actually runs. Defenders need to identify projects with the relevant controller configuration and then map those projects to deployed PLC applications.

## Availability risk belongs in process context

A controlled stop is safer than uncontrolled execution, but it is still a loss of application availability. Its consequence depends on what the PLC application does, how the surrounding process fails, and how quickly authorized operators can recognize and restart it. The advisory does not claim a particular physical impact, so defenders should evaluate that consequence locally rather than infer one from the vulnerability alone.

Network position is equally important. “Adjacent” does not mean harmless; it means exploitability depends on who and what can originate traffic on the controller’s segment. Flat production networks, shared maintenance access, temporary engineering connections, and poorly governed remote-access paths can expand that set. Segmentation and tightly controlled access can reduce reachability, but they do not remove the vulnerable code or replace the vendor update.

Prioritization should therefore combine three facts: whether the project embeds the affected controller, whether its deployed version is vulnerable, and whether untrusted or weakly controlled systems can reach its segment. Add process criticality and restart requirements to decide maintenance order.

## The fix has three deployment stages

CERT@VDE directs users to update CODESYS PROFINET to version 4.8.0.0. For existing projects, that installation alone is insufficient. Administrators must also update the PROFINET Controller in the project’s device tree to the latest version and perform a new download of the CODESYS application to the PLC.

That sequence creates three states defenders should track separately: the add-on available in the engineering environment, the component version referenced by the project, and the application version running on the controller. A green status at the first stage says nothing conclusive about the other two.

Before the change, preserve the approved project and current controller state according to site procedures, identify the restart and rollback owners, and coordinate the maintenance window with operations. After deployment, confirm that the PLC application returned to its intended running state, expected PROFINET communication resumed, and the device-tree component now reflects the fixed release. Record that evidence against the individual asset and project, not just the engineering workstation.

## Turn project content into patch evidence

This advisory exposes a recurring OT blind spot: some security fixes are carried inside application artifacts. Package inventory can show that engineers have obtained a repair while field devices continue to execute the older component embedded in an unchanged project.

Defenders should make project-level version evidence part of vulnerability management. Maintain a mapping between controller assets, approved project revisions, embedded communication components, and deployment timestamps. Require change records to distinguish “update installed,” “project updated,” and “controller redeployed,” then verify each state independently.

The practical goal is not simply to close CVE-2026-35226 in a scanner. It is to prove that every affected PLC is running an application built with the corrected PROFINET Controller—and that the process returned safely after the change.
