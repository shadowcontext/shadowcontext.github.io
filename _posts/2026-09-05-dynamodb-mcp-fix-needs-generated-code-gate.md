---
title: "DynamoDB MCP Fix Makes Generated Infrastructure a Review Boundary"
subtitle: "A newly disclosed code-injection flaw shows why model files and generated deployment code need separate trust gates."
description: "AWS fixed CVE-2026-85654 in its DynamoDB MCP server, underscoring the need to review model inputs and generated infrastructure before deployment."
date: 2026-09-05 11:09:25 +0400
layout: post
category: ai-security
tags: [mcp, code-generation, cloud-security, secure-development]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-05-dynamodb-mcp-fix-needs-generated-code-gate.svg
image_alt: "Abstract layers of data-model nodes passing through a luminous review shield before reaching an infrastructure grid"
key_points:
  - "Upgrade awslabs.dynamodb-mcp-server to 2.1.6 or later."
  - "Treat data-model files and generated deployment code as untrusted artifacts."
  - "Separate generation from deployment with review, testing, and least privilege."
sources:
  - title: "CVE-2026-85654 - Code injection in the CDK generator in Amazon awslabs.dynamodb-mcp-server"
    publisher: "Amazon Web Services · September 4, 2026"
    url: "https://aws.amazon.com/security/security-bulletins/2026-097-aws/"
  - title: "AWS DynamoDB MCP Server"
    publisher: "Python Package Index · August 14, 2026"
    url: "https://pypi.org/project/awslabs.dynamodb-mcp-server/2.1.6/"
---

AWS has disclosed a code-injection vulnerability in the CDK generator of its open-source DynamoDB Model Context Protocol server. The fix is straightforward, but the defensive lesson is broader: an AI-assisted infrastructure workflow crosses a security boundary when a structured model becomes executable deployment code.

## What AWS disclosed

AWS published its advisory for CVE-2026-85654 on September 4. The issue affects `awslabs.dynamodb-mcp-server` versions 2.0.10 through 2.1.5 and is fixed in version 2.1.6. AWS classifies the bulletin as important and recommends moving to the latest version, including patching forks or derivative code that incorporated the affected implementation.

The vulnerable component generates AWS Cloud Development Kit infrastructure from a DynamoDB data-model file. According to AWS, improper neutralization of special elements in a template engine could, in certain circumstances, let a context-dependent actor cause arbitrary code to run on the host that deploys the generated application. The relevant input can be carried in crafted table, index, or attribute names in the model file.

That scope matters. This is not a claim that every MCP interaction, DynamoDB table, or CDK deployment is exposed. The disclosed path requires an affected server version, a data model containing crafted names, generation through the affected component, and execution on the deployment host. AWS did not state in the advisory that exploitation had been observed, and defenders should not infer an incident from the disclosure.

## Why the boundary is easy to miss

The package describes a workflow in which an assistant can help design a DynamoDB model and generate a CDK application from `dynamodb_data_model.json`. A JSON model may look like passive configuration, but in a generator it influences source code that may later run with the credentials and network access of a developer workstation or build runner.

The central risk is therefore a trust transition, not merely a malformed name. Data can move from conversation or repository content into a model file, then through templates into code, and finally into a privileged deployment step. Validation that proves a schema is structurally correct does not automatically prove that every value is safe in the syntax of the generated program.

This distinction applies well beyond one package. AI coding tools increase the speed and distance between input and execution. A plausible-looking generated diff can conceal a dangerous transformation, particularly when deployment follows generation automatically. The safe control point is the handoff between the two stages.

## What defenders should do now

Teams using the DynamoDB MCP server should inventory installed and pinned versions, including copies embedded in development containers, workstation tool configurations, CI images, and internal forks. Upgrade affected installations to 2.1.6 or later. PyPI confirms that 2.1.6 is a published release; teams should still use their normal provenance and integrity checks when updating.

AWS advises organizations that cannot upgrade immediately to manually inspect `dynamodb_data_model.json` for unexpected table, index, or attribute names before running the generator, and to avoid model files from untrusted or unverified sources. That is a temporary measure, not a substitute for the patched package.

For durable protection, require generated infrastructure code to enter version control as a reviewable artifact. Run syntax, policy, and security checks before execution; produce and inspect a deployment plan; and require an explicit approval before applying changes. The account used for generation should not automatically inherit deployment authority. Build runners should have short-lived credentials, restricted network access, and permissions limited to the intended environment.

## Proving the fix in the workflow

A package upgrade is necessary evidence, but it is only the first layer. Record the resolved version from the environment that actually runs the MCP server rather than relying on a manifest alone. Rebuild development or CI images so an older cached package cannot remain active, and verify that internal forks contain the upstream correction.

Then test the control boundary safely. Feed the patched workflow representative model names containing punctuation and other unusual but legitimate characters, generate the CDK output in an isolated environment, and confirm that the result remains valid data rather than altered program structure. Do not test with exploit payloads on production systems.

Finally, confirm that generation cannot trigger deployment without a separate identity and approval event. CVE-2026-85654 is a focused template-handling flaw, but its lasting lesson is architectural: model inputs, generated code, and deployment execution are three distinct trust zones, and each transition needs its own proof.
