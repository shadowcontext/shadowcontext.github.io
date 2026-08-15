---
title: "Apache Struts Fixes Need Feature-Level Exposure Proof"
subtitle: "Four new flaws show why framework patching must begin with a map of optional request paths and runtime configuration."
description: "Apache Struts fixes four resource and concurrency flaws; defenders should verify versions, JSON plugin use, locale settings, and CSP report endpoints."
date: 2026-08-16 00:09:43 +0400
layout: post
category: defense
tags: [apache-struts, vulnerability-management, java, application-security]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-16-apache-struts-fixes-need-feature-level-proof.svg
image_alt: "Abstract editorial illustration of four data streams passing through bounded gateways into isolated application chambers"
key_points:
  - "Upgrade supported Struts deployments to 6.11.0 or 7.3.0."
  - "Confirm JSON plugin, CSP reporting, and locale configuration rather than inferring exposure from a package version alone."
  - "Test concurrency isolation and resource ceilings after the rollout."
sources:
  - title: "Apache Struts: Shared parsing state in the JSON plugin"
    publisher: "Apache Software Foundation · 15 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/73xxx/CVE-2026-73631.json"
  - title: "Apache Struts: Shared serialization state in the JSON plugin"
    publisher: "Apache Software Foundation · 15 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/73xxx/CVE-2026-73632.json"
  - title: "Apache Struts: Unbounded read of a Content Security Policy violation report"
    publisher: "Apache Software Foundation · 15 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/73xxx/CVE-2026-73634.json"
  - title: "Apache Struts: Unbounded growth of localized-text caches driven by the request locale"
    publisher: "Apache Software Foundation · 15 August 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/73xxx/CVE-2026-73635.json"
---

Apache has published four new Apache Struts vulnerability records with a shared operational message: knowing that a framework is present is not the same as knowing which vulnerable path is reachable. The fixes cover two resource-exhaustion conditions in Struts core and two cross-request state flaws in the optional JSON plugin. Defenders should upgrade, but the useful proof comes from matching the running version to enabled features and configuration.

## Four flaws, four exposure conditions

CVE-2026-73635 is a moderate-severity resource-allocation flaw. Apache says an unauthenticated remote client can influence the locale used for localized-text lookups when an application has no fixed locale. That can grow internal caches without a bound, exhaust the Java heap and deny service. The affected ranges extend through Struts 2.3.37, 2.5.33, 6.10.0 and 7.2.1. Applications configured with a fixed locale are not affected.

CVE-2026-73634 is also rated moderate, but its path is different. A Struts application that exposes an endpoint to collect Content Security Policy violation reports can read a submitted report into memory without a size bound. Apache says one request may exhaust the heap. Struts does not map such an endpoint by default, so applications that do not collect these reports are outside the stated affected condition. Versions 6.0.0 through 6.10.0 and 7.0.0 through 7.2.1 are affected.

The other two records concern Struts 7.2.1 and the JSON plugin. CVE-2026-73631, rated moderate, involves parsing state shared across concurrent requests. Data associated with one request could become observable in another, while configured parsing limits may not work as intended. CVE-2026-73632, rated low, similarly concerns shared serialization state in the plugin's SMD/JSON-RPC handling, potentially exposing response content across requests. Apache stresses that the relevant JSON paths are not enabled by default.

## Patch first, then prove the path

Apache recommends moving to Struts 6.11.0 or 7.3.0. That should be the default remediation for supported deployments. Older 2.x installations named in CVE-2026-73635 need particular attention because the published fixed versions are on maintained 6.x and 7.x lines; migration planning cannot stop at finding an old artifact in a repository.

Inventory should operate at three levels. First, resolve the Struts version actually packaged in each deployed application, including shaded dependencies and application-server copies. Second, identify whether the JSON plugin is present and whether JSON request population or SMD/JSON-RPC handling is configured. Third, review application routes and settings for CSP report collection and a fixed locale. This turns four broad version alerts into a precise remediation queue without treating configuration as a substitute for an available security update.

## Verification must test isolation and limits

A successful deployment report only proves that an artifact moved. It does not prove that every application instance loaded the fixed library or that old nodes left service. Capture the resolved dependency and running build from each deployment target, then compare them with the fixed 6.11.0 or 7.3.0 baseline.

The post-update checks should reflect the failure modes. Exercise CSP reporting with safely bounded test traffic and confirm the endpoint enforces a request-size ceiling. Under controlled concurrency, verify that JSON parsing and serialization retain per-request isolation. Monitor heap use and cache cardinality while varying legitimate locale headers, and confirm that a fixed-locale policy behaves consistently where the application requires one. These are defensive regression tests, not attempts to reproduce denial of service.

## The durable lesson is feature-aware evidence

Framework findings often arrive as package names and version ranges. These records demonstrate why that evidence is necessary but incomplete: one flaw depends on locale configuration, another on an application-defined reporting endpoint, and two on optional JSON behaviors. A useful vulnerability record should therefore join software inventory, route ownership, plugin configuration and runtime verification.

For defenders, the immediate action is straightforward: upgrade, remove superseded nodes, and record the running version. The stronger control is a repeatable application inventory that can answer which request paths are enabled before the next advisory arrives.
