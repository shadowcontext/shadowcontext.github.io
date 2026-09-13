---
title: "Strapi Preview Fix Needs Role-Boundary Proof"
subtitle: "A stored-XSS fix shows why content preview must be treated as privileged code rendering, not a harmless editorial convenience."
description: "CVE-2026-90561 makes Strapi rich-text preview a role-boundary issue requiring a v5 upgrade, v4 migration and focused validation."
date: 2026-09-13 19:10:06 +0400
layout: post
category: defense
tags: [strapi, content-security, xss, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-13-strapi-preview-fix-needs-role-boundaries.svg
image_alt: "Abstract layered content cards passing through a luminous preview window while an amber fragment is stopped outside a protected cyan workspace"
key_points:
  - "CVE-2026-90561 affects Strapi 4.x through 4.26.2 and Strapi 5.x before 5.48.1."
  - "Lower-privileged content can execute in a higher-privileged user's browser when rich-text preview is opened."
  - "Teams should upgrade supported v5 deployments, migrate from v4 and test the preview path across editorial roles."
sources:
  - title: "Strapi 4.x through 4.26.2 and 5.x before 5.48.1 Stored XSS via WYSIWYG"
    publisher: "CVE Program / VulnCheck · September 13, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/90xxx/CVE-2026-90561.json"
  - title: "Release v5.48.1"
    publisher: "Strapi · June 17, 2026"
    url: "https://github.com/strapi/strapi/releases/tag/v5.48.1"
  - title: "Security Policy"
    publisher: "Strapi · accessed September 13, 2026"
    url: "https://github.com/strapi/strapi/security"
---

A newly published Strapi vulnerability turns an ordinary editorial action into a privilege boundary. CVE-2026-90561 concerns stored cross-site scripting in the content manager’s rich-text preview: content supplied by a lower-privileged user can run in a more privileged user’s browser when that user opens the preview.

This is a vulnerability disclosure, not an incident report, and the public record does not claim exploitation. The useful defensive lesson is broader than filtering one field. Any interface that converts stored, user-controlled content into active browser output belongs in the application’s trust model.

## What the record confirms

The CVE record, published on September 13, identifies Strapi 4.x through 4.26.2 and Strapi 5.x before 5.48.1 as affected. It describes a failure to remove active script elements from rich text before the WYSIWYG preview renders it. The documented path requires a user with content-writing permission and a second, more privileged user who opens the preview.

That interaction matters for prioritisation. The issue is not presented as an unauthenticated compromise of every Strapi deployment. It depends on editorial permissions, a rich-text field and preview use. Yet those conditions are normal in a multi-role content workflow, and the CVE record rates the issue critical under CVSS 4.0 because the browser session crossing the boundary may carry substantially greater authority.

The Strapi 5.48.1 release provides the concrete repair point. Its notes say the WYSIWYG preview moved from its previous HTML sanitiser to DOMPurify. The associated change also adds tests around the sanitisation contract. Defenders should take the fixed release as the minimum v5 baseline named by the disclosure, not treat the underlying library swap as a configuration recipe for older installations.

## Why preview is a security boundary

CMS permission models often focus on server-side actions: who can draft, publish, configure or administer. CVE-2026-90561 shows a second path. A contributor may lack administrative permissions yet still control material that an administrator’s browser later interprets. If the preview renderer turns that material into active content, the browser becomes a bridge between roles.

For defenders, this means “draft” and “unpublished” are not synonyms for safe. Stored content can be security-relevant before publication, precisely because reviewers, editors and administrators inspect it inside trusted management interfaces. The review workflow should therefore be modelled like any other untrusted-input pipeline: identify the producer, the transformation, the renderer and the authority present at the destination.

This framing also improves testing. A generic scan of the public website may never exercise the affected route. Validation must cover the administration interface and use representative roles, field types and preview actions without placing harmful content into production.

## The version decision is asymmetric

For Strapi 5, the action is direct: move every deployment below 5.48.1 to a current supported release, rebuild the administration application where the deployment process requires it, redeploy and verify the running version. Teams should include cloned environments, regional instances and infrequently used authoring systems; a package manifest alone is not proof of what users are actually loading.

Strapi’s security policy says version 4 reached the end of security updates in April 2026. The CVE record includes the entire 4.x line through 4.26.2 as affected and does not identify a patched v4 release. That makes this a migration decision rather than an indefinite patch-waiting exercise. If migration cannot be immediate, reducing access to the admin interface, narrowing rich-text write permissions and limiting preview use may reduce exposure, but these are temporary risk controls, not a vendor-confirmed fix.

## What defenders should prove

Start with an inventory of running Strapi versions and the applications that expose the content manager. Then map which roles can write rich-text fields, which higher-privileged roles review them and whether the WYSIWYG preview is part of routine approval. This produces a defensible priority order instead of treating every installation as identical.

After upgrading, confirm the application serves the rebuilt admin assets and that caches or content-delivery layers are not retaining an older bundle. Exercise a safe regression suite that verifies active elements are neutralised while legitimate formatting, links and media still behave as intended. Finally, review browser-side controls such as a restrictive Content Security Policy as independent containment. Such controls can reduce impact, but they should support—not replace—the corrected renderer and a maintained software branch.

The closure criterion is evidence across the whole path: a supported running version, refreshed admin assets, preserved editorial function and proof that lower-trust content cannot become active code in a higher-trust session.
