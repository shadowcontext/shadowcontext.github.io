---
title: "PostgreSQL Anonymizer 3.2 Makes Masking Roles a Security Boundary"
subtitle: "Three newly published CVEs show why privacy tooling must never inherit unchecked database privilege."
description: "PostgreSQL Anonymizer 3.2 fixes three privilege paths and adds a superuser barrier. Defenders need a tested upgrade and dedicated masking role."
date: 2026-09-07 11:11:42 +0400
layout: post
category: defense
tags: [postgresql, data-masking, least-privilege, vulnerability-management]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-07-postgresql-anonymizer-fix-needs-role-boundaries.svg
image_alt: "Abstract database layers behind a translucent privacy veil, with a bright role boundary separating elevated access from masked data"
key_points:
  - "PostgreSQL Anonymizer 3.2 addresses three paths that could execute code with elevated database privileges."
  - "The release adds a default barrier against running masking operations on behalf of a PostgreSQL superuser."
  - "Teams should use a dedicated masking role and verify the extension rebuild, rule migration, and effective runtime identity."
sources:
  - title: "Release 3.2"
    publisher: "PostgreSQL Anonymizer · 5 September 2026"
    url: "https://gitlab.com/dalibo/postgresql_anonymizer/-/commit/8f37288202b872a3ab11bea770bb5cfd8450f697"
  - title: "PostgreSQL Anonymizer: unprivileged masked users can execute code via operators, domain casts and view subqueries"
    publisher: "PostgreSQL CVE Program · 6 September 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/19xxx/CVE-2026-19633.json"
  - title: "PostgreSQL Anonymizer: SQL injection in import_database_rules() and import_roles_rules() via crafted object names / JSON"
    publisher: "PostgreSQL CVE Program · 6 September 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/19xxx/CVE-2026-19634.json"
  - title: "PostgreSQL Anonymizer: Privilege escalation to superuser via anon.anonymize_database_parallel()"
    publisher: "PostgreSQL CVE Program · 6 September 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/83xxx/CVE-2026-83534.json"
---

Data masking is supposed to reduce trust, not quietly borrow the database’s most powerful identity. Three PostgreSQL CVE records published on September 6 show how that promise can fail when masking expressions, imported rules or parallel jobs cross a privilege boundary.

PostgreSQL Anonymizer 3.2 addresses all three issues and introduces a broader safeguard: by default, the extension refuses to run masking operations on behalf of a superuser. The practical response is therefore more than a package update. Teams need to know which role actually performs masking, rebuild the extension through its supported upgrade path, and prove that policies still protect data afterward.

## What the new records establish

[CVE-2026-19633](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/19xxx/CVE-2026-19633.json) affects versions before 3.1.4. PostgreSQL’s record says an unprivileged masked user could abuse operators, domain casts or view subqueries carrying untrusted expressions, causing code to run with elevated privileges when the extension evaluates them. It receives a high CVSS 3.1 score of 8.8.

[CVE-2026-19634](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/19xxx/CVE-2026-19634.json), also fixed in 3.1.4, concerns the two rule-import functions. A malicious JSON document with crafted object names could lead to code execution with superuser privileges if a superuser later imports it. The record scores this issue medium at 6.4 and advises removing those user-facing import functions as a workaround.

[CVE-2026-83534](https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/83xxx/CVE-2026-83534.json) affects versions before 3.2.0. It says a table owner could run arbitrary code as superuser through the parallel database-anonymization function. Its CVSS 3.1 score is 6.4, and the published workaround is to disable static masking.

The project’s release note calls all three vulnerabilities critical, while the standardized records assign one high and two medium scores. That difference should not obscure the common consequence: attacker-controlled database objects or rules may be evaluated through a more privileged execution path. None of the primary sources reviewed here reports exploitation or an organizational compromise.

## Upgrade the extension, not only the package

Version 3.2 is the clean target because it incorporates all three fixes and the new superuser barrier. The project urges every user to upgrade promptly and says risk is especially high on PostgreSQL 14 and instances upgraded from PostgreSQL 14 or earlier.

This change needs preparation. The project’s upgrade documentation says `ALTER EXTENSION ... UPDATE` is not supported; administrators must drop and recreate the extension. It also says the import/export JSON schema changed between 3.1 and 3.2 and recommends re-exporting rules after the upgrade. Those constraints turn a nominal patch into a policy migration with availability and correctness implications.

Inventory each database where the extension is installed, record the extension and PostgreSQL versions, and identify the masking modes in use. Capture approved masking rules and dependencies through the project’s supported export and backup procedures. Rehearse the drop-and-recreate sequence on representative non-production data, including failure recovery, before scheduling production work.

## Make the execution identity explicit

The release’s durable control is separation of duties. PostgreSQL Anonymizer 3.2 refuses by default to run masking on behalf of a superuser and tells users of static, replica or backup masking to create a dedicated role. Preserve that default. The compatibility option that removes the barrier should not become a shortcut around migration work.

Grant the dedicated role only the permissions required for the chosen masking workflow. Document who can change masking labels, create trusted functions, import rule files and invoke masking jobs. Treat externally supplied JSON, custom operators, domains, views and masking functions as code-bearing inputs that require review before privileged use.

This matters because access control at the database connection is not enough when a lower-privileged user can shape an object that a privileged workflow later evaluates. The review boundary must cover both who starts the job and who controls every object the job consumes.

## Verify privacy and privilege after migration

A successful installation is only the first test. Confirm the running extension reports version 3.2, the superuser barrier remains enabled, and scheduled jobs authenticate as the dedicated role. Exercise each masking mode in a staging copy and compare results against an approved policy baseline: protected fields should remain masked, permitted fields should remain usable, and unexpected expressions should fail closed.

Then test operational recovery. Ensure monitoring detects failed masking runs, retains enough context for diagnosis without logging sensitive values, and assigns failures to an owner. Record the database, extension version, effective role, migrated rule-set version and validation result as closure evidence.

Privacy controls often sit close to the most sensitive data and therefore acquire broad permissions. PostgreSQL Anonymizer 3.2 is a reminder that the safer design is the opposite: constrain the masking identity, distrust rule inputs, and verify both secrecy and privilege after every change.
