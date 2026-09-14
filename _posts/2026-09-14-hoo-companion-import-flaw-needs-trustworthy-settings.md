---
title: "Hoo Companion Import Flaw Makes Theme Settings a Trust Boundary"
subtitle: "A newly published stored-XSS flaw requires plugin removal and restoration of known-good theme settings, not a routine update ticket."
description: "CVE-2026-85129 exposes Hoo Companion 1.0.2 to unauthenticated settings replacement and stored XSS, with no fixed release listed."
date: 2026-09-14 09:11:02 +0400
layout: post
category: defense
tags: [wordpress, stored-xss, plugin-security, configuration-integrity]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-14-hoo-companion-import-flaw-needs-trustworthy-settings.svg
image_alt: "Abstract theme-setting cards pass through a fractured import portal toward a protected browser surface, with an amber barrier isolating untrusted input"
key_points:
  - "CVE-2026-85129 says Hoo Companion 1.0.2 permits unauthenticated replacement of active theme settings and stored cross-site scripting."
  - "WordPress.org has closed the plugin pending review and lists no version newer than the affected 1.0.2 release."
  - "Defenders should remove the plugin, restore trusted settings and verify rendered pages as well as files."
sources:
  - title: "Hoo Companion 1.0.2 - Unauthenticated Stored XSS via Theme Settings Import"
    publisher: "WPScan CNA · September 13, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/85xxx/CVE-2026-85129.json"
  - title: "Hoo Companion – WordPress plugin"
    publisher: "WordPress.org Plugin Directory · accessed September 14, 2026"
    url: "https://wordpress.org/plugins/hoo-companion/"
---

A newly published WordPress vulnerability makes configuration integrity part of incident prevention. CVE-2026-85129 says Hoo Companion 1.0.2 accepts an unauthenticated theme-settings import without authorization, validation or adequate sanitization. The result is not only stored cross-site scripting: the same request can replace the site’s existing theme settings. With the plugin closed and no fixed release listed, defenders need a removal and recovery plan rather than a routine update.

## What the record confirms

The [CVE record](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/85xxx/CVE-2026-85129.json) was published by the WPScan CNA on September 13. It identifies Hoo Companion 1.0.2 and earlier as affected, with 1.0.2 the only explicit version in the record. The weakness is classified as cross-site scripting and carries a high CVSS 3.1 score of 8.8.

The important path is the plugin’s theme-settings import. According to the record, the feature does not perform authorization or validation checks and stores submitted data as the active theme’s settings without sanitizing it. Injected web script can then execute for a visitor who loads the affected output, including an administrator. The record also says the request destroys the site’s existing theme settings.

Those are vulnerability properties, not proof of abuse. The record does not claim active exploitation, identify affected websites or document an organizational compromise. Finding version 1.0.2 establishes exposure to vulnerable code; it does not establish that hostile settings were submitted. Teams should preserve that distinction in tickets, executive updates and customer communications.

## Closure removes the easy patch path

The [official WordPress.org page](https://wordpress.org/plugins/hoo-companion/) says Hoo Companion has been closed since September 4, 2026 and is unavailable for download while a full review is pending. It lists version 1.0.2, says the plugin was last updated eight years ago and shows no newer release. The page does not identify CVE-2026-85129 as the reason for closure, so that connection should not be inferred.

What defenders can establish is narrower and sufficient: the directory offers no fixed version beyond the affected build. Waiting for an automatic plugin update therefore has no evidenced endpoint. Disabling the extension can reduce reachable behavior, but removal is the stronger destination because dormant plugin files can be reactivated by an operator, deployment process or restored site image.

Removal alone is not the whole fix. Because the vulnerable operation writes active theme settings, a clean plugin directory does not prove the current configuration is trustworthy. Site owners must account for both the executable component and the state it could change.

## Contain the component and recover state

Start by searching managed WordPress inventories and deployed filesystems for the exact `hoo-companion` slug. Record the version, activation state, internet exposure, active theme, owner and last known settings backup. Do not use a loose name match: similarly named companion plugins are separate products, and misidentification wastes the response window.

For a confirmed installation, restrict public reachability if that can be done safely, preserve relevant web and administrative logs under normal retention rules, and export the current configuration for comparison. Remove the plugin through the organization’s controlled deployment process. If business-critical theme functions depend on it, reproduce those dependencies in staging with maintained components rather than keeping the affected code as a fallback.

Restore theme settings from a known-good source whose creation time and custody can be established. Where no trusted backup exists, rebuild settings from approved design specifications and compare them with the current state. Review rendered pages for unexpected scripts, redirects, overlays or altered navigation, but treat any anomaly as a lead for investigation—not automatic proof that this CVE was used.

## Close on behavior, not inventory alone

Verification needs three layers. Confirm that the plugin slug is absent from active and inactive plugin directories, deployment artifacts and reusable site images. Confirm that the intended theme configuration survives a clean deployment without importing the suspect state. Finally, test representative public and administrator pages with browser developer tools and the organization’s normal scanning controls to ensure expected resources load and unauthorized script does not.

Document the before-and-after file inventory, the provenance of restored settings and the pages tested. If removal is delayed, assign an owner and short expiry to the exception, minimize reachability and monitor changes to theme options. A scanner can show that vulnerable files disappeared; only configuration provenance and rendered-page checks show that the affected trust boundary was actually repaired.
