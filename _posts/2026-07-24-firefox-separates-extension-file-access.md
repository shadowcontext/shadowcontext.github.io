---
title: "Firefox Separates Extension Access to Local Files"
subtitle: "A new off-by-default permission gives defenders a cleaner boundary between browsing access and files stored on a device."
description: "Firefox 153 separates extension access to local files, giving users and defenders a clearer least-privilege control to review."
date: 2026-07-24 03:08:35 +0400
layout: post
category: defense
tags: [browser-security, extensions, least-privilege, firefox]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-07-24-firefox-separates-extension-file-access.svg
image_alt: "Abstract local file sheets protected behind a luminous permission boundary, with browser extension nodes held outside"
key_points:
  - "Firefox 153 makes local-file access a separate desktop extension permission."
  - "The permission is off by default, including for extensions already installed."
  - "Defenders should validate legitimate workflows before granting file access."
sources:
  - title: "Firefox 153 WebExtensions API updates"
    publisher: "Mozilla Add-ons Community Blog · July 23, 2026"
    url: "https://blog.mozilla.org/addons/2026/07/23/firefox-153-webextensions-api-updates/"
  - title: "Firefox 153 release notes for developers (Stable)"
    publisher: "MDN · updated July 22, 2026"
    url: "https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/153"
---

Browser extensions often need broad visibility to do useful work. That does not mean every website permission should quietly open a path to files stored on the device.

Mozilla’s July 23 WebExtensions update says Firefox 153 now treats access to `file://` URLs as a distinct desktop permission. The setting is off by default for all extensions, including add-ons that were installed before the browser update. That is a meaningful least-privilege change—and one that defenders should verify rather than assume will be invisible to users.

## One broad grant no longer covers local files

Before Firefox 153, Mozilla says an extension with the “Access your data for all websites” host permission could also read local pages addressed through the `file://` scheme. The new release separates those capabilities. An extension must now receive the dedicated “Access local files on your computer” permission through its permissions settings.

The distinction matters because web content and local content are different trust zones. A host permission may be justified for a password manager, accessibility tool, developer utility, or content filter across many sites. Local files can contain exported reports, saved pages, documentation, or other material that was never intended to be in the same access scope.

The change does not prove that an extension is safe, nor does denying local-file access remove every extension risk. It does make the browser’s authority model easier to understand: permission to operate broadly on the web is no longer, by itself, permission to inspect local file URLs.

## Secure defaults can also reveal hidden dependencies

Mozilla warns that extensions which depend on local-file access may stop working with those files after users upgrade, until the permission is enabled. That is expected behavior from an off-by-default control, but it creates an operational test for managed environments.

Support teams should expect some users to interpret a blocked workflow as a broken browser or add-on. The safe response is not to instruct everyone to enable the setting. First identify the extension, the business task, and the specific local content it needs. Confirm the add-on’s provenance and current ownership, then decide whether the file-access capability is necessary for that user group.

This is also a useful discovery exercise. If a business process fails only when an extension loses implicit local-file access, the organization has learned that the process carried more privilege than its inventory may have recorded. That dependency belongs in extension reviews, workstation baselines, and support documentation.

## Developers need permission-aware behavior

Mozilla says the `extension.isAllowedFileSchemeAccess()` method now correctly reports whether a user has granted file-scheme access. Calls from developer tools that evaluate content on `file://` URLs are subject to the same permission.

Extension developers should use that state to fail clearly. When access is absent, the add-on should explain which feature is unavailable and why, while leaving unrelated functions working where possible. Mozilla recommends considering a prompt or fallback path for extensions that genuinely depend on local files. A request should appear at the moment of need, not as a vague demand during an unrelated task.

Firefox 153 also adds a stable `documentId` across several WebExtension interfaces. Mozilla explains that frame identifiers can outlive the document loaded inside a frame; using a document-specific identifier lets an operation fail if the content has changed instead of silently targeting the replacement document. Although separate from the file permission, the design principle is aligned: bind authority to the narrow object and moment for which it was intended.

## Turn the browser change into an access review

Defenders can use the rollout to establish a simple extension-control baseline. Inventory installed add-ons, record which ones legitimately require local-file access, and compare that need with the setting actually granted. Prioritize extensions deployed widely, installed outside a managed catalog, or capable of reading and modifying content across many sites.

For approved exceptions, document the business owner and the workflow that requires access. Test the extension after the browser update with the permission denied and, where justified, enabled. The objective is to confirm both sides of the boundary: routine browsing features should continue without unnecessary file access, while an approved local-file workflow should work only after an explicit grant.

Permission prompts are not a substitute for extension governance. They are most valuable when they expose a decision that was previously bundled into a broader one. Firefox 153 gives users and administrators a clearer question to answer: does this extension need the web, the device’s local files, or both?
