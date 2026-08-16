---
title: "WordPress Multisite Import Needs Network-Level Authority"
subtitle: "A migration-plugin fix shows why a site administrator must not inherit control over an entire WordPress network."
description: "CVE-2026-17533 makes network-level authorization and post-update role testing priorities for WordPress multisite defenders."
date: 2026-08-16 14:10:03 +0400
layout: post
category: defense
tags: [wordpress, vulnerability-management, authorization, multisite]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-16-wordpress-multisite-import-needs-network-level-authority.svg
image_alt: "Abstract layered website panels behind a guarded import channel, representing network-level authorization for WordPress multisite migration"
key_points:
  - "CVE-2026-17533 affects All-in-One WP Migration and Backup versions before 7.108."
  - "The reported impact is specific to multisite, where subsite and network authority must remain separate."
  - "Defenders should verify the installed version and test import permissions with representative roles."
sources:
  - title: "All-in-One WP Migration and Backup < 7.108 - Multisite Subsite Admin+ Network-Wide PHP Code Execution via REST Import"
    publisher: "CVE Program (WPScan) · 16 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/17xxx/CVE-2026-17533.json"
  - title: "All-in-One WP Migration and Backup – WordPress plugin"
    publisher: "WordPress.org · updated August 2026"
    url: "https://wordpress.org/plugins/all-in-one-wp-migration/"
---

A newly published vulnerability record puts a narrow but important boundary in focus for WordPress multisite operators: authority over one site is not authority over the network. The practical response is to update, then prove that migration features enforce that distinction.

## What the advisory establishes

The CVE Program record for CVE-2026-17533, published on 16 August, identifies an improper privilege-management flaw in All-in-One WP Migration and Backup before version 7.108. According to the record, the affected import functionality on multisite installations did not restrict access to network administrators. A user who administered one subsite could therefore invoke an import with consequences across the network, including arbitrary PHP code execution.

That description defines both the severity and the scope. It does not describe an unauthenticated path, and it does not say every ordinary WordPress installation is affected. The relevant condition is a multisite deployment in which a lower-tier site administrator exists and the vulnerable plugin version is installed.

The WordPress.org changelog independently aligns with the advisory. Version 7.108 says that site import on multisite now requires network-level capabilities and credits the same researcher named in the CVE record. The directory currently lists version 7.109, so defenders have a fixed release available rather than only a workaround.

## Why import is a control-plane function

Migration tools are unusually powerful because importing a site is not equivalent to uploading an image or editing a post. An import can replace or reconstruct application state, content, configuration and executable components. In a multisite environment, those effects can cross the boundary between a tenant-like subsite and the shared WordPress network.

That makes the import path a control-plane operation. Its authorization check must answer a network-level question: is this user permitted to alter the shared environment? A generic check that merely confirms the user is an administrator can be misleading because WordPress multisite deliberately has more than one administrative tier.

The defensive lesson extends beyond this plugin. Any extension that performs backup restoration, migration, theme or plugin management, database replacement, or network configuration should be reviewed for the scope of the capability it checks. Role names are not enough; the permission should correspond to the resource and blast radius of the action.

## Patch first, then verify the boundary

Operators should identify multisite networks running All-in-One WP Migration and Backup and confirm the installed version from the actual runtime, not only from an asset spreadsheet. Versions before 7.108 fall within the CVE record's affected range. Updating to the current supported release is the direct remediation indicated by the advisory and changelog.

After updating, test the authorization outcome with representative accounts. A subsite administrator should be denied network-scoped import operations, while the intended network administrator workflow should continue to function. Perform that check in a controlled environment or maintenance window with a harmless test artifact; a production import is not necessary to prove that the access decision occurs.

Review exposure as well. If REST endpoints or migration interfaces are reachable more broadly than operationally required, narrow that reach using supported application and network controls. This is defense in depth, not a substitute for the fixed version: an authenticated user may already be inside the permitted management surface.

## Make the evidence durable

Close the remediation only when three pieces of evidence agree: the running plugin version is fixed, lower-privilege roles cannot reach the network-scoped action, and expected network-administrator operations still work. Save those results with the change record so a later configuration drift or rollback can be detected.

Multisite inventories should also record administrative tiers, not just plugin names and versions. A network with delegated subsite administrators has a different authorization risk from a single-owner installation. Capturing that distinction makes vulnerability triage more accurate and turns a one-time patch into a repeatable control: high-impact operations must be authorized at the same scope as the changes they can make.
