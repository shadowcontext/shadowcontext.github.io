---
title: "ArcadeDB Fix Restores Cross-Database Access Boundaries"
subtitle: "Version 26.7.2 closes an authorization gap across time-series, batch, Prometheus, and Grafana handlers."
description: "ArcadeDB 26.7.2 fixes cross-database access gaps, underscoring why every service endpoint needs one fail-closed authorization boundary."
date: 2026-08-02 20:09:47 +0400
layout: post
category: defense
tags: [vulnerability-management, authorization, databases, access-control]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-02-arcadedb-fix-restores-database-boundaries.svg
image_alt: "Abstract database cylinders in separate glowing chambers with a continuous security boundary around each compartment"
key_points:
  - "ArcadeDB versions before 26.7.2 lack database access checks in several server endpoints."
  - "The affected handlers cover batch and time-series integrations, including Prometheus and Grafana paths."
  - "Defenders should upgrade, verify endpoint behavior, and centralize authorization before database resolution."
sources:
  - title: "Cross-database IDOR: /ts/*, /batch/*, Prometheus and Grafana handlers bypass authorization"
    publisher: "ArcadeData · July 9, 2026"
    url: "https://github.com/ArcadeData/arcadedb/security/advisories/GHSA-x8mg-6r4p-87pf"
  - title: "ArcadeDB 26.7.2"
    publisher: "ArcadeData · July 9, 2026"
    url: "https://github.com/ArcadeData/arcadedb/releases/tag/26.7.2"
---

ArcadeDB has fixed a server-side authorization flaw that could let a user with access to one database reach another database through a set of specialized HTTP handlers. The maintainer says version 26.7.2 is the patched release. For defenders, the important lesson is broader than one product: an authenticated request is not necessarily authorized for the resource named in its path.

## What the advisory establishes

The maintainer advisory identifies the affected package as `com.arcadedb:arcadedb-server` and lists all versions before 26.7.2 as affected. The problem sits in roughly 14 handlers serving batch and time-series functions, including Prometheus-compatible and Grafana-facing routes.

According to ArcadeData, those handlers resolved the database name supplied in the request path without first applying the product's per-database access check. A user permitted to use one database could therefore read from or write to a different database through the affected routes. The ordinary command route did apply the expected check, which is a useful clue: the weakness was inconsistent enforcement across parallel interfaces, not the complete absence of an authorization model.

ArcadeData rates the advisory High. Its public record does not claim exploitation in the wild, identify victims, or describe an organizational compromise. Defenders should keep those distinctions intact: the confirmed fact is a product flaw with a released fix.

## Why specialized endpoints create blind spots

Modern databases often expose several protocol surfaces around the same underlying data. Administrative commands may travel through one handler family while observability tools, bulk jobs, dashboards, and time-series clients use others. Each surface can authenticate the caller successfully yet still make a different authorization decision.

That separation is where drift becomes dangerous. A mature access-control check in the primary query path provides no protection if an auxiliary route opens the requested database first and checks permissions later—or never. Monitoring integrations deserve particular attention because teams may treat them as read-only plumbing even when an endpoint can accept writes or broad queries.

The defensive pattern is to resolve identity and authorization before resolving the requested database or processing a payload. ArcadeData says the patched handlers now enforce database authorization before payload handling, return a denial for unauthorized access, and fail closed when a database name is missing. The batch path also performs its check before forwarding work to a cluster leader.

## What defenders should do now

Inventory server-mode and multi-tenant ArcadeDB deployments, including containers and embedded dependencies that may package the server component. Confirm the running artifact rather than relying only on a deployment manifest: the patched baseline is 26.7.2, and the release notes strongly recommend upgrading server-mode or multi-tenant installations.

Treat the upgrade as a controlled change. ArcadeData notes two compatibility considerations in 26.7.2: durable Raft storage is enabled by default, and the Bolt protocol now returns native temporal types instead of ISO-8601 strings. Review storage placement for Raft data and test clients that consume date or time values before promoting the release.

After rollout, test with at least two deliberately separated low-privilege identities and databases. A user scoped to database A should receive a denial when the same supported batch, time-series, Prometheus, or Grafana operation targets database B. Record those negative tests as deployment evidence; a version string alone does not prove that every node, image, or route is on the corrected build.

Also review network exposure and service accounts. Restrict database HTTP interfaces to the clients that need them, give dashboard and telemetry identities only the necessary database permissions, and investigate unexpected cross-database requests in access logs. These measures reduce risk while upgrades move through change control, but they do not replace the fix.

## The durable engineering lesson

Authorization should be a shared, fail-closed boundary, not a convention every endpoint author must remember. New routes should inherit or call one common guard that binds the authenticated principal to the requested database before any lookup, forwarding, or body processing occurs.

Security tests should enumerate route families against the same access matrix. For every role and database pair, test both allowed and denied outcomes across command, batch, time-series, dashboard, and monitoring interfaces. That turns a one-off patch into a regression control—and makes the next specialized integration less likely to reopen the same boundary.
