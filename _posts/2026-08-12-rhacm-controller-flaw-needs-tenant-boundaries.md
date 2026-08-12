---
title: "RHACM Controller Flaw Needs Stronger Tenant Boundaries"
subtitle: "A critical confused-deputy flaw shows why controller authority must not be inherited from a tenant-supplied destination."
description: "CVE-2026-70398 makes RHACM tenant roles, controller authority, and vendor-status tracking immediate defensive priorities."
date: 2026-08-12 12:10:32 +0400
layout: post
category: defense
tags: [kubernetes, multicluster, access-control, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-12-rhacm-controller-flaw-needs-tenant-boundaries.svg
image_alt: "Abstract cluster control core holding a protected token while a tenant path is stopped at a layered namespace boundary"
key_points:
  - "Red Hat rates CVE-2026-70398 Critical with a preliminary CVSS score of 9.6."
  - "A low-privileged authenticated tenant can make a trusted controller write a spoke-cluster token to a chosen namespace."
  - "Defenders should restrict tenant control-plane roles, inspect relevant resources, and track Red Hat's evolving fix status."
sources:
  - title: "CVE-2026-70398"
    publisher: "Red Hat · 12 August 2026"
    url: "https://access.redhat.com/security/cve/CVE-2026-70398"
  - title: "A flaw was found in multicloud-integrations, a component..."
    publisher: "GitHub Advisory Database · 12 August 2026"
    url: "https://github.com/advisories/GHSA-cjw2-r57r-pwvf"
---

A newly public vulnerability in Red Hat Advanced Cluster Management for Kubernetes turns a trusted multicluster controller into the security boundary that defenders must examine first. Red Hat rates CVE-2026-70398 Critical and gives it a preliminary CVSS score of 9.6.

The disclosure is about a product flaw, not an organizational compromise. Its practical significance is architectural: a tenant with limited control-plane access may be able to direct a more powerful controller across an intended namespace boundary.

## What Red Hat confirmed

Red Hat says the flaw is in `multicloud-integrations`, a component of Red Hat Advanced Cluster Management, or RHACM. An authenticated tenant can manipulate the `GitOpsCluster` controller so that it writes a spoke-cluster bearer token to a namespace chosen by that tenant. The vendor says this can disclose sensitive tokens, enable privilege escalation, and circumvent Argo CD AppProject constraints.

The published CVSS vector describes a network-reachable issue with low attack complexity, low privileges required, and no user interaction. It assigns high confidentiality and integrity impact but no availability impact. Those characteristics explain the critical score without turning the issue into an unauthenticated internet entry path: the actor must already hold an authenticated tenant role capable of reaching the relevant control-plane objects.

Red Hat characterizes the weakness as a confused-deputy problem. The controller possesses authority that the requesting tenant does not, but accepts a tenant-influenced destination when exercising that authority. The result is a privilege boundary failure between the caller, the controller, the destination namespace, and the managed-cluster credential.

## Why controller authority changes the risk

Kubernetes authorization reviews often stop at the permissions directly granted to a human or service account. Controllers complicate that model because a low-privileged principal can create or modify an object that causes a controller to act later with its own credentials.

That means an apparently narrow permission—such as managing a custom resource in one tenancy workflow—can have a wider effective reach if a privileged reconciler trusts fields that name namespaces, secrets, service accounts, or remote clusters. The important question is not only “what can this tenant read or write?” It is also “what can this tenant cause each controller to read, copy, or create?”

CVE-2026-70398 makes that second question operationally urgent for RHACM environments. AppProject restrictions remain useful, but Red Hat’s statement says this path can circumvent them. A policy at one layer cannot compensate for a controller that carries data across the layer’s boundary.

## Defensive priorities while status evolves

Start by identifying RHACM deployments and the exact `multicloud-integrations` build or image running in each hub. Record the installed version, release channel, and Red Hat affected-status or errata reference. Do not infer safety from an OpenShift or hub version alone, and do not treat a generic scanner match as proof of affectedness; use Red Hat’s product-specific assessment as it changes.

Next, review who can create or modify `GitOpsCluster` resources and other objects consumed by multicluster controllers. Reduce those permissions to current operational need, especially in shared or delegated environments. This is risk reduction based on the disclosed attack precondition, not a substitute for a vendor fix.

Inspect existing `GitOpsCluster` specifications and recent control-plane changes for unexpected destination namespaces or changes outside approved deployment workflows. Also confirm that alerts cover privileged controllers writing secrets into namespaces they do not normally service. Keep that review focused on configuration evidence rather than assuming exploitation.

Red Hat’s page says no mitigation currently meets its criteria for broad applicability, stability, and ease of deployment. Defenders should therefore avoid inventing an unsupported configuration workaround and monitor the CVE record and linked errata for an approved update. If review finds an unexplained token copy or namespace redirection, follow the organization’s credential-response process and assess rotation carefully because spoke-cluster tokens are operational dependencies.

## The durable control

Every multicluster controller should be treated as an authorization service, not merely automation. Admission rules must validate tenant-controlled references against the caller’s allowed scope, while controller identities should hold only the authority required for reconciliation.

For defenders, the durable test is simple to state: a tenant-controlled field must never let a trusted controller select a destination that the tenant could not access directly. Proving that property across custom resources, namespace references, and secret-handling paths is stronger than relying on the apparent narrowness of the tenant role.
