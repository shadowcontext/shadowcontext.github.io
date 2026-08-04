---
title: "Microsoft 365 App Permissions Need Purpose-Level Proof"
subtitle: "New ecosystem research shows why tenant admins should test every app grant against a documented business purpose."
description: "A new Microsoft 365 app study turns opaque permission requests into a practical agenda for consent controls, access review, and least privilege."
date: 2026-08-04 15:11:12 +0400
layout: post
category: defense
tags: [Microsoft 365, OAuth, identity security, least privilege]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-04-m365-app-permissions-need-purpose-proof.svg
image_alt: "Abstract editorial image of translucent application nodes passing through a narrowing consent gateway into protected data layers"
key_points:
  - "New research found inconsistent permission visibility across Microsoft 365 app channels."
  - "A marketplace listing is not proof that an app's requested access matches its function."
  - "Tenant owners should govern consent, review grants, and demand a purpose for every scope."
sources:
  - title: "Lost in Permissions: Exploring the Microsoft 365 App Ecosystem"
    publisher: "arXiv · 3 August 2026"
    url: "https://arxiv.org/abs/2608.02336"
  - title: "Manage app consent policies"
    publisher: "Microsoft Learn · 6 August 2025"
    url: "https://learn.microsoft.com/en-gb/entra/identity/enterprise-apps/manage-app-consent-policies"
  - title: "Best practices for using Microsoft Graph permissions"
    publisher: "Microsoft Learn · accessed 4 August 2026"
    url: "https://learn.microsoft.com/en-us/graph/best-practices-graph-permission"
---

A Microsoft 365 app can look like a small productivity add-on while carrying access to mail, files, calendars, chats or directory data. New research suggests tenant defenders cannot rely on the app marketplace to make that access relationship consistently visible. The practical response is to treat every consent grant as an identity decision that needs a named purpose, a bounded scope and an expiry or review point.

## What the research found

In a preprint submitted on 3 August, researchers from Politecnico di Torino and Microsoft describe what they call the first privacy- and security-oriented measurement of the Microsoft 365 third-party app ecosystem. They combined public marketplace interfaces with automated tenant-side deployment to crawl more than 8,000 applications.

Only 1,069 apps in the collected set exposed both a description and a permission set, according to the paper. The researchers also report inconsistent transparency across official distribution channels. That matters because defenders need both halves of the record: what an app says it does and what the tenant authorizes it to do.

The team clustered apps by topic, then used anomaly detection to compare permission profiles among apps with similar stated functions. LLM-assisted analysis and a blind manual inspection were applied to the most anomalous cases. The authors report a relationship between unusual permission profiles and the risk of the permissions requested, including broad tenant-wide scopes.

This is a preprint, not a finding that every unusual app is malicious or unsafe. An anomaly is a review signal, and the study's visible subset is much smaller than its overall crawl. The defensible conclusion is narrower: description, distribution channel and requested permissions do not automatically form a coherent assurance record.

## Consent is a security boundary

OAuth consent can create durable access without giving an app a human administrator role. Delegated permissions allow an app to act in a signed-in user's context; application permissions allow it to act as itself, without a user present. The risk therefore depends on permission type, resource scope and the business process behind the grant—not simply on the app's name or publisher.

Microsoft's own Graph guidance says developers should request the fewest permissions needed and notes that application permissions carry greater privacy risk because they can access data without a signed-in user. It also recommends resource-specific consent where available. For a tenant reviewer, that guidance becomes an approval test: if a narrower delegated or resource-specific permission can support the function, a tenant-wide application permission needs a documented reason.

Publisher verification is useful provenance, but it is not evidence that every requested scope is necessary. Likewise, presence in an official marketplace helps establish a distribution path; it does not replace a tenant's own authorization decision.

## Build a permission-to-purpose register

Start with an inventory of enterprise applications and service principals, including delegated grants and app-role assignments. For each production app, record an accountable owner, publisher, business function, data resources, permission type, exact scopes, consent source and last review date. A grant without an owner or current purpose belongs in a remediation queue.

Review broad read/write and directory-wide scopes first. Ask the app owner to map each permission to a feature actually in use. Compare the current grant with current documentation rather than the original onboarding ticket; features and permission requests can change independently. Where the mapping is unclear, do not infer necessity from successful operation alone. Test a reduced permission set in a controlled tenant or work with the vendor to establish the minimum.

Revocation also needs change control. Removing access from a legitimate integration can interrupt workflows, so capture dependencies, schedule the change, observe failures and retain a rollback decision. The objective is evidence-backed reduction, not indiscriminate deletion.

## Put policy before the prompt

Microsoft Entra app consent policies can constrain which users may consent and can evaluate conditions such as publisher verification, app origin and requested permissions. Use those controls to route higher-risk requests into an admin consent workflow instead of making the consent screen the only checkpoint.

The review should produce three artifacts: a permission-to-purpose mapping, an approval with a review date, and telemetry expectations for the app identity. Monitor consent changes and new credentials, but also watch how the app uses the access it already has. A static grant can remain unchanged while its operational behavior shifts.

The new study's most useful lesson is procedural. Marketplace discovery, consent approval and continuing access review are separate controls. Defenders should connect them with evidence so that every powerful permission remains explainable after the person who clicked “accept” has moved on.
