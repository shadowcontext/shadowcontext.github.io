---
title: "Canonical Kubernetes Upgrades Need Network-Path Proof"
subtitle: "Version 1.36 LTS changes the default service-routing path, making post-upgrade verification as important as the package refresh."
description: "Canonical Kubernetes 1.36 changes service routing and datastore support, requiring defenders to verify the live network path after upgrades."
date: 2026-08-24 13:09:37 +0400
layout: post
category: defense
tags: [kubernetes, network-security, hardening, patch-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-08-24-canonical-kubernetes-upgrade-needs-network-path-proof.svg
image_alt: "Abstract teal cluster nodes route through a luminous eBPF ring toward a protected amber datastore core"
key_points:
  - "New clusters use Cilium's eBPF datapath instead of kube-proxy by default."
  - "Upgraded clusters retain kube-proxy until administrators explicitly change the routing mode."
  - "Defenders should verify routing, policy enforcement, telemetry, and datastore readiness after rollout."
sources:
  - title: "1.36"
    publisher: "Canonical Kubernetes documentation · 24 August 2026"
    url: "https://documentation.ubuntu.com/canonical-kubernetes/main/releases/snap/1.36/"
  - title: "How to harden your Canonical Kubernetes cluster"
    publisher: "Canonical Kubernetes documentation · 22 July 2026"
    url: "https://documentation.ubuntu.com/canonical-kubernetes/main/snap/howto/security/hardening/"
---

Canonical Kubernetes 1.36 LTS changes more than component versions. Its default network path for newly bootstrapped clusters no longer includes `kube-proxy`, while upgraded clusters keep their existing behavior unless an administrator deliberately switches it. That split makes the running state—not the release label—the security fact defenders must verify.

## One release, two routing states

Canonical's 24 August release notes say new 1.36 clusters using the default Cilium network route services through Cilium's eBPF datapath and do not deploy `kube-proxy`. A cluster upgraded from an earlier release continues to run `kube-proxy` until an administrator opts out. Two clusters reporting the same Kubernetes version can therefore have different packet paths, policy dependencies, failure modes, and telemetry.

That distinction should be captured in asset and control inventories. Teams should record whether `kube-proxy` is present, which Cilium mode is active, and where service-routing evidence is collected. A version check alone cannot establish that a planned datapath migration occurred—or that an unplanned one did not.

The release also deprecates several kube-proxy-related settings. Canonical says `kube-proxy-client-crt`, `kube-proxy-client-key`, and `extra-node-kube-proxy-args` are ignored while the default Cilium network is enabled without `kube-proxy`. Configuration management may still show those values as deployed even though they no longer govern runtime behavior. Defenders should treat accepted-but-ignored settings as drift and test the effective state directly.

## Network changes widen the verification scope

Version 1.36 updates Cilium and Cilium Operator to 1.19.4, moves Gateway API custom resources to v1.4.1, and changes the bundled MetalLB options: the FRR-backed BGP mode is no longer shipped, while the native backend gains multi-peer configuration. Each change touches a place where reachability and trust are expressed.

A safe rollout should therefore test representative service flows, denied flows, ingress and egress policy, gateway behavior, and load-balancer advertisements. Observability matters too: dashboards and detections built around iptables, kube-proxy processes, or an FRR component may become incomplete after the architecture changes. The goal is not merely to prove that applications respond. It is to prove that intended paths work, forbidden paths remain blocked, and security telemetry still describes the path actually in use.

This is an editorial inference from the release architecture, not a claim that the new datapath is insecure. The operational risk comes from assuming controls and monitoring move automatically when the component enforcing or exposing them changes.

## Datastore readiness is a hard gate

Canonical has removed `k8s-dqlite`, which was deprecated in 1.35. The release notes state that etcd is now the only supported built-in datastore, external etcd remains possible, and clusters still using `k8s-dqlite` cannot refresh to 1.36. Canonical also says there is no migration path in this release; the refresh is blocked and the cluster stays on its current revision.

That makes datastore identification a pre-upgrade gate, not a rollback detail. Operators should confirm the current backend, backup and recovery procedures, quorum health, and the target design before scheduling the change. The release does add etcd learner mode during node join to reduce quorum-loss risk, but that improvement does not remove the need to test restoration and administrative access.

## Close the rollout with security evidence

Canonical's hardening guidance says the distribution applies many recommendations by default, while leaving some measures to administrators because of compatibility or performance costs. It calls out controls such as secrets encryption at rest, authorization modes, API audit logging, event-rate limits, image-pull policy, and restricted bind addresses.

After upgrading, defenders should rerun their chosen compliance assessment and compare results with the pre-change baseline. Then verify control-plane and worker placement, because 1.36 says control-plane-only controllers no longer run on worker nodes. The completion record should include the observed routing mode, policy tests, telemetry coverage, datastore state, controller placement, and any hardening exceptions. In a release that intentionally permits different runtime paths, evidence of the live design is the real upgrade outcome.
