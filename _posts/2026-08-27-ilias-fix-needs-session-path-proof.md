---
title: "ILIAS Critical Fix Needs Session-Path Proof"
subtitle: "CVE-2026-80428 turns two unauthenticated application paths into one urgent upgrade and verification task."
description: "ILIAS 9.22, 10.10 and 11.3 fix a critical unauthenticated deserialization flaw linking session creation to Shibboleth logout."
date: 2026-08-27 05:10:31 +0400
layout: post
category: defense
tags: [ilias, vulnerability-management, identity-security, patching]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-27-ilias-fix-needs-session-path-proof.svg
image_alt: "Abstract session tiles moving through a guarded identity gateway into isolated application layers"
key_points:
  - "CVE-2026-80428 connects unauthenticated session input with unsafe processing in a Shibboleth logout path."
  - "ILIAS 9.22, 10.10 and 11.3 remove the vulnerable logout-notification implementation."
  - "Closure requires proof of the running release and checks across every reachable application path."
sources:
  - title: "ILIAS before 9.22, 10.10 and 11.3 Unauthenticated PHP Object Injection via Shibboleth Logout Endpoint"
    publisher: "VulnCheck · August 26, 2026"
    url: "https://www.vulncheck.com/advisories/ilias-before-9.22-10.10-and-11.3-unauthenticated-php-object-injection-via-shibboleth-logout-endpoint"
  - title: "CVE-2026-80428"
    publisher: "NIST National Vulnerability Database · August 26, 2026"
    url: "https://nvd.nist.gov/vuln/detail/CVE-2026-80428"
  - title: "fixed 48152"
    publisher: "ILIAS-eLearning · vendor commit"
    url: "https://github.com/ILIAS-eLearning/ILIAS/commit/f36934a6f937d0fe837ca6e642986458b4069a95"
---

ILIAS has fixed a critical vulnerability that joins two application paths defenders may have assessed separately. CVE-2026-80428 allows an unauthenticated caller to place untrusted data into session state and reach unsafe processing through a Shibboleth logout endpoint. The right response is an urgent upgrade followed by proof that every served instance is running the corrected code.

## What the disclosure establishes

VulnCheck, the CVE numbering authority for the record, describes an object-injection flaw in ILIAS, an open-source learning management system. The affected ranges are releases before 9.22, the 10.x line before 10.10, and the 11.x line before 11.3. The disclosure assigns a 9.3 score under CVSS 4.0 and 9.8 under CVSS 3.1. It says the issue is network-reachable, requires no prior privileges or user interaction, and can result in code execution with the web-server user's permissions.

The weakness is not simply “Shibboleth is enabled.” According to the advisory, the logout handler reads live session records and deserializes stored data without limiting which PHP classes may be constructed. Separately, an unauthenticated LTI authentication entry point can place request-controlled values into a session. The security consequence emerges when those paths meet.

The public sources establish vulnerability and impact, not exploitation against any organisation. Defenders should treat the severity and reachability as reasons to accelerate remediation without converting a vulnerable-version finding into an unsupported incident claim.

## Why feature inventory can miss the exposure

Security inventories often record major integrations—single sign-on, LTI, public course access—rather than the individual routes and code paths that implement them. That can produce a misleading answer: a team may conclude that it does not use Shibboleth logout while the relevant endpoint remains deployed, or overlook an LTI entry path because it is not part of the primary login journey.

Start with the release line, then verify deployed paths. Identify every ILIAS production, staging, disaster-recovery and externally reachable test instance. Record its effective version, how traffic reaches it, and whether old application trees remain addressable beside the current deployment. Include reverse-proxy routes and alternate hostnames; a route omitted from the main user interface can still exist on the server.

Configuration evidence can refine priority, but it should not replace the fixed release. The disclosed condition crosses components, and the vendor correction removes the vulnerable logout-notification implementation rather than relying on an administrator to safely preserve it.

## Upgrade, rebuild and verify

Move each supported branch to at least ILIAS 9.22, 10.10 or 11.3 as appropriate. Use the project's release and upgrade procedures for the branch in service, preserve a rollback plan, and test the legitimate identity flows the deployment actually uses. A rollback package must not silently restore the vulnerable application tree.

The vendor commit provides a useful verification anchor: it removes most of the former back-channel logout implementation from `components/ILIAS/AuthShibboleth/resources/shib_logout.php`, including the session-table processing and deserialization logic. Defenders should not manually copy that diff as a substitute for a supported update. They can, however, use the changed file and release version to confirm that the intended code reached every node.

After rollout, inspect the artifact or application directory on each serving instance, restart relevant PHP workers or application services as required by the deployment, and verify which nodes receive traffic. Exercise normal login, logout and learning-tool integrations so that a security fix does not leave an untested identity failure.

## Evidence that closes the finding

A defensible closure record should contain the instance list, previous and current ILIAS versions, deployed artifact identifiers, serving-node checks and successful identity-flow tests. It should also account for retired directories, standby systems and snapshots that could reintroduce an older release.

The broader lesson is about path composition. Session creation, federated logout and object lifecycle handling may belong to different feature owners, yet their security properties combine at runtime. Vulnerability management is strongest when it verifies the complete input-to-processing path—and then proves the fixed code is the code actually serving users.
