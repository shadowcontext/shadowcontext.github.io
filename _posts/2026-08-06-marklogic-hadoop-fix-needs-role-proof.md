---
title: "MarkLogic Hadoop Fix Needs Role-and-Service Proof"
subtitle: "A critical privilege path makes integration roles, XDBC reachability, and exact server versions one remediation problem."
description: "A critical MarkLogic Hadoop flaw crosses into the Security database; defenders should update, narrow roles, and verify XDBC exposure."
date: 2026-08-06 09:11:01 +0400
layout: post
category: defense
tags: [vulnerability-management, database-security, least-privilege, patching]
author: ShadowContext Research
read_time: 5 min
importance: urgent
image: /assets/img/editorial/2026-08-06-marklogic-hadoop-fix-needs-role-proof.svg
image_alt: "Abstract layered database core protected by a luminous role boundary as a single amber integration path is narrowed before reaching it"
key_points:
  - "CVE-2026-9193 lets a low-privileged Hadoop integration user reach privileged operations against the MarkLogic Security database."
  - "Progress identifies MarkLogic 11.3.6 and 12.0.3 as the fixed baselines for the affected release lines."
  - "Defenders should combine upgrading with role reduction, trusted-host restrictions, unused-service shutdown, and post-change evidence."
sources:
  - title: "Privilege escalation in Progress MarkLogic Server Hadoop integration"
    publisher: "Progress Software · 5 August 2026"
    url: "https://github.com/CVEProject/cvelistV5/blob/main/cves/2026/9xxx/CVE-2026-9193.json"
  - title: "Issues fixed in MarkLogic Server 11.3.6"
    publisher: "Progress · updated 5 August 2026"
    url: "https://docs.progress.com/bundle/marklogic-bugfixes-list/page/topics/11/11.3.6.html"
  - title: "Release Notes"
    publisher: "Progress · updated 10 July 2026"
    url: "https://docs.progress.com/bundle/marklogic-server-whats-new-11/page/topics/release-notes.html"
---

Progress has published a critical MarkLogic Server vulnerability that turns a narrowly assigned Hadoop integration role into access to privileged operations against the database's security layer. CVE-2026-9193 is not an argument for treating every authenticated user as an administrator. It is a reason to fix the software while also proving that the integration surface is smaller than the application estate around it.

The reviewed sources report a vulnerability and corrected releases, not exploitation or an organizational compromise. The defensive priority comes from the boundary the flaw crosses: a low-privileged integration identity can reach operations against the Security database.

## What Progress has established

The CVE record, published by Progress on 5 August, describes improper privilege management in MarkLogic Server's Hadoop integration. An authenticated user holding a low-privileged Hadoop role can escalate privileges and execute privileged operations against the Security database. Progress assigns the issue a CVSS 3.1 score of 9.9 and identifies it as CWE-269.

The affected ranges are explicit: MarkLogic Server 11.0.0 up to, but excluding, 11.3.6, and 12.0.0 up to, but excluding, 12.0.3. That makes 11.3.6 and 12.0.3 the first fixed versions in their respective lines. Version evidence should therefore include the complete patch number; a record that says only “11” or “12” cannot establish safety.

Progress also updated its 11.3.6 fixed-issues page on 5 August. The page now lists ten addressed CVEs, including CVE-2026-9193. The release itself shipped on 1 July, and the associated release notes direct customers on 11.3.5 to upgrade to 11.3.6. This timing is important for operations teams: an already-deployed July build may now carry newly published security significance, so asset records and change tickets may need to be revisited even when no new package was released yesterday.

## Why the integration boundary matters

Hadoop and bulk-loading integrations often sit outside the everyday application path, which can make them easy to omit from exposure reviews. Yet their purpose is to move or process substantial data, and their service identities may retain permissions long after a migration, analytics job, or proof of concept ends.

CVE-2026-9193 shows why role names are not proof of effective privilege. A “low-privileged” role describes intended authorization, but vulnerable code can create a path across that boundary. Defenders should map the identity, service endpoint, network route, and database version together. Looking at any one of those in isolation can produce false assurance.

This is also a useful distinction between patching and containment. Progress's listed workarounds reduce opportunity: limit Hadoop integration privileges to users who need MLCP or Hadoop integration, restrict network access to XDBC App Servers used for MLCP operations to trusted hosts, and disable those XDBC App Servers when they are unnecessary. Those measures narrow the reachable surface, but they do not replace moving to a fixed MarkLogic release.

## Build an evidence-led response

Start by identifying every MarkLogic cluster in the two affected release families, including development, recovery, analytics, and short-lived migration environments. Query the running server version from the system itself and record each cluster member; do not rely only on an intended build in a deployment manifest.

Next, enumerate identities with Hadoop integration privileges and connect each one to a current owner and workload. Remove dormant assignments, reduce shared identities, and confirm that scheduled jobs still use only the access they require. Inventory XDBC App Servers used for MLCP, document their listeners and permitted source networks, and disable unused instances. Where a service must remain online until maintenance, restrict it to known integration hosts as Progress advises.

Upgrade affected 11.x systems to 11.3.6 or later and affected 12.x systems to 12.0.3 or later, following the vendor's supported cluster procedure. Afterward, capture the running version on every node, verify expected integration jobs with a non-production test, and confirm that unauthorized roles cannot perform security-administration actions.

## What to preserve after the change

Keep a compact assurance record: cluster and node identifiers, previous and fixed versions, Hadoop-role membership before and after, XDBC listener state, allowed source networks, and the result of a representative integration test. Review logs for unexpected security-database operations or unexplained changes in integration-role use, while treating such signals as investigation prompts rather than proof of exploitation.

Finally, track the other CVEs named on Progress's updated 11.3.6 page as separate review items. The immediate lesson from CVE-2026-9193 is precise: a fixed build closes the code path, while role and service evidence shows that the surrounding integration boundary is intentionally controlled.
