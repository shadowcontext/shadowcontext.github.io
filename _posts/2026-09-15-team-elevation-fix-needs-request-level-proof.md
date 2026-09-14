---
title: "TEAM Elevation Fix Needs Request-Level Authorization Proof"
subtitle: "AWS’s TEAM update shows why just-in-time access must bind every action to the approved request, account, and role."
description: "AWS fixed a high-severity TEAM authorization flaw; defenders should upgrade and verify ownership checks across temporary-access workflows."
date: 2026-09-15 01:09:43 +0400
layout: post
category: defense
tags: [identity-security, access-control, cloud-security, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-15-team-elevation-fix-needs-request-level-proof.svg
image_alt: "Abstract cloud access gateway with an hourglass token passing through layered authorization rings toward isolated account nodes"
key_points:
  - "TEAM deployments before 1.5.1 are affected; AWS lists no workaround."
  - "Inventory self-deployed copies and forks, then carry the upstream fixes into each one."
  - "Test ownership and scope checks for every read, approval, change, and revocation path."
sources:
  - title: "CVE-2026-86830 - Incorrect privilege assignment in Temporary Elevated Access Management (TEAM) for AWS IAM Identity Center"
    publisher: "Amazon Web Services · September 14, 2026"
    url: "https://aws.amazon.com/security/security-bulletins/2026-112-aws/"
  - title: "Incorrect privilege assignment in Temporary Elevated Access Management (TEAM) for AWS IAM Identity Center"
    publisher: "GitHub Security Advisory · September 14, 2026"
    url: "https://github.com/aws-samples/iam-identity-center-team/security/advisories/GHSA-6x87-mjv8-mgvj"
  - title: "v1.5.1"
    publisher: "aws-samples/iam-identity-center-team · September 14, 2026"
    url: "https://github.com/aws-samples/iam-identity-center-team/releases/tag/v1.5.1"
---

AWS has fixed a high-severity authorization weakness in Temporary Elevated Access Management, or TEAM, its open-source sample for granting time-bound access through IAM Identity Center. The update matters because the affected component sits at the point where a routine application user can become a privileged cloud operator.

The immediate action is narrow: find TEAM deployments and upgrade them to version 1.5.1. The broader lesson is more durable. A just-in-time access portal is an authorization system, not simply a workflow interface, and every operation on an access request needs its own server-enforced identity and scope decision.

## What the advisory confirms

AWS’s [security bulletin](https://aws.amazon.com/security/security-bulletins/2026-112-aws/) says CVE-2026-86830 affects TEAM versions before 1.5.1. Under the identified condition, an authenticated user with application-level access could obtain unintended temporary elevated access to AWS accounts managed by the deployment. AWS classifies the bulletin as important and lists no workaround.

The [GitHub security advisory](https://github.com/aws-samples/iam-identity-center-team/security/advisories/GHSA-6x87-mjv8-mgvj) adds the authorization detail defenders need for triage. It says an authenticated remote user with application access might be able to read, approve, modify or revoke arbitrary access requests. Those actions could then lead to elevated access that the deployment was not intended to grant. The advisory rates the issue High, with a CVSS 3.1 score of 7.2 and CVSS 4.0 score of 8.6.

This is a vulnerability advisory, not evidence that a deployment was compromised. Neither primary source reports exploitation, affected customers or an organizational breach. Response teams should therefore avoid turning a version finding into an incident claim while still treating the access-control boundary seriously.

## Why temporary access needs object-level controls

TEAM is a self-hosted sample solution rather than an AWS-managed service. Its purpose is to let authorized users request, approve, monitor and invoke elevated access for a limited period. That reduces standing privilege, but it also concentrates consequential decisions into a small application: who may act on a request, which account it targets, which permission set it carries and how long the grant lasts.

Authentication answers whether a person can enter that application. It does not answer whether the person may view or change a particular request. The new advisory’s list of affected actions shows why defenders should model an access request as a protected object throughout its lifecycle. Ownership, approver authority, account scope, role scope and allowed state transition should be checked on the server for every operation, including reads and revocations—not inferred from possession of an application session or from values supplied by the client.

The [1.5.1 release notes](https://github.com/aws-samples/iam-identity-center-team/releases/tag/v1.5.1) identify three security fixes. They include removing identity-pool IAM authorization rules, deriving account names and roles server-side, and restricting a Slack token setting to administrators. The notes specifically associate the authorization-rule change with this CVE. They also say the release fixes three security issues, so teams should deploy the complete release rather than extracting only one change.

## A defensible upgrade path

Start with deployment discovery. Search infrastructure repositories, CloudFormation histories, internal service catalogs and IAM Identity Center application inventories for TEAM. Record the deployed revision, public or private reachability, owning team and the AWS accounts and permission sets the instance can grant. Because the bulletin explicitly calls out forked and derivative code, a package or tag search alone is insufficient; locally renamed copies remain in scope.

Upgrade every affected deployment to 1.5.1 or later. For forks, compare the upstream security changes with local authorization rules and carry forward the fixes without discarding intentional local controls. AWS provides no workaround, so network restriction can reduce exposure but should not be recorded as remediation.

Before closing the work, use safe negative tests in a non-production environment. Confirm that a requester cannot read or alter another user’s request, approve their own request, substitute a different account or role, revive an expired grant, or revoke outside their authority. Verify that server-side records—not browser-submitted labels—determine the account and permission scope. Then confirm that denials are logged with enough identity, request and target context for review.

## Close on evidence, not version labels

A reported version is only the beginning of assurance for a self-deployed authorization service. Capture the deployed artifact or commit, the upstream fixes incorporated into any fork, and the results of request-level denial tests. Also review who retains application access and approver membership; the advisory requires an authenticated application user, so least privilege at that layer remains valuable even after patching.

Temporary elevation is supposed to replace broad, persistent trust with a specific, reviewable grant. The repaired boundary should demonstrate exactly that: one identified requester, one authorized approval path, one server-bound account and role, and one limited interval—with every other combination denied.
