---
title: "Duplicati Custom Install Paths Need a Permission Review"
subtitle: "A Windows privilege-escalation flaw shows why backup software paths belong in security baselines."
description: "CERT/CC warns that Duplicati 2.3.0.1 can expose a LocalSystem privilege path when Windows installations use a non-default directory."
date: 2026-07-22 23:09:00 +0400
layout: post
category: defense
tags: [vulnerability-management, windows-security, backup-security, access-control]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-22-duplicati-custom-paths-need-permission-review.svg
image_alt: "Abstract blue backup vault surrounded by layered access-control rings, with an amber path diverted toward a guarded boundary"
key_points:
  - "Duplicati 2.3.0.1 on Windows is affected when installed outside the default Program Files directory."
  - "A standard local user may be able to turn weak directory permissions into LocalSystem execution."
  - "Defenders should inventory custom installs and verify both effective permissions and service image paths."
sources:
  - title: "VU#847406: Duplicati backup software v2.3.0.1 is vulnerable to an incorrect permission assignment vulnerability"
    publisher: "CERT/CC · July 22, 2026"
    url: "https://www.kb.cert.org/vuls/id/847406"
---

Backup software is supposed to preserve the recovery path. A newly published CERT/CC vulnerability note shows why the software’s own installation boundary deserves equal attention. On Windows, Duplicati 2.3.0.1 can expose a route from ordinary local access to the operating system’s highest service privilege when the product is installed outside its default directory.

The immediate task is narrow: find custom Duplicati installations, examine who can modify their program files, and treat unexpected write access as a security defect rather than a deployment quirk.

## What CERT/CC confirmed

CERT/CC identifies the issue as CVE-2026-16157 and describes it as an incorrect permission assignment affecting Duplicati 2.3.0.1 on Windows. The vulnerable condition is tied to installation outside the default `C:\Program Files\` location.

Duplicati runs a Windows service with `LocalSystem` privileges. According to the advisory, a non-default installation path may not receive permissions equivalent to the protected default location. If a standard local user can write into the directory from which that privileged service loads its software, the separation between the user and the service collapses. The result can be arbitrary code execution as `LocalSystem`.

This is a local privilege-escalation issue, not a claim of remote compromise or observed exploitation. An attacker would first need ordinary access on the Windows host. That prerequisite matters, but it does not make the flaw harmless: local footholds are often deliberately constrained, and service boundaries are meant to stop a low-privilege account from taking control of the machine.

## Why backup hosts need stricter boundaries

Backup tooling occupies an unusually sensitive position. It commonly runs continuously, reads broad sets of files, holds destination credentials, and participates directly in restoration. A privilege boundary failure in that layer can therefore affect more than the application itself.

The defensive lesson is broader than one installer. A secure default is not automatically preserved when administrators redirect an application to another volume, a legacy tools directory, or a shared software tree. Windows access control follows the destination’s inherited permissions unless an installer explicitly replaces them. A path chosen for capacity or convention can quietly become writable by users who should never be able to alter service binaries.

That makes installation location part of the security configuration. Asset records that capture only product name and version will miss the condition that activates this vulnerability. Defenders need the executable path, service account, directory owner, inherited access-control entries, and effective write permissions to understand the real exposure.

## A focused response for defenders

Start by identifying Windows systems running Duplicati 2.3.0.1 and separating default from non-default installations. Query software inventory and Windows service configuration, then validate the results on representative hosts; display names and inventory records can diverge from the service’s actual executable path.

For every custom path, check effective permissions on the installation directory and its parent. Standard users should not be able to create, replace, rename, or modify executable content used by the privileged service. Review inherited permissions as well as explicit entries, because correcting only a child folder can leave future deployments exposed to the same parent-level mistake.

CERT/CC’s note should remain the authority for remediation and release guidance. Where an approved update is available, route it through the normal change process, preserve configuration and recovery information, and verify the installed version afterward. If updating cannot happen immediately, moving to a protected default location or correcting directory access controls may reduce exposure, but those changes require testing and should not be presented as a substitute for vendor-supported remediation.

## Verify the boundary, not just the version

Closure should require evidence. Confirm the service image path, inspect effective write access using a non-administrative test context, and ensure the application still starts, performs a backup, and completes a controlled restore after remediation. Monitor for unplanned changes beneath the installation directory, especially on hosts where interactive users are permitted.

The durable control is a deployment baseline that couples privileged services with protected paths. Version compliance answers whether known code has been updated. Permission verification answers whether the operating system will keep that code under administrator control. Backup resilience depends on both.
