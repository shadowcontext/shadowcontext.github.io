---
title: "Restify Static Files Need a Filesystem Boundary"
subtitle: "A newly published path-traversal flaw makes static-file scope an immediate deployment question."
description: "CVE-2026-90494 affects Restify's static-file handler; defenders should map exposed routes, narrow file access, and watch for a maintained fix."
date: 2026-09-14 01:08:59 +0400
layout: post
category: defense
tags: [restify, nodejs, vulnerability-management, path-traversal]
author: ShadowContext Research
read_time: 5 min
importance: notable
image: /assets/img/editorial/2026-09-14-restify-static-files-need-filesystem-boundaries.svg
image_alt: "Abstract editorial illustration of file tiles approaching a luminous route while a layered boundary contains one diverted tile"
key_points:
  - "CVE-2026-90494 describes remote path traversal in Restify's serveStatic handler through version 12.0.0."
  - "The public record does not identify a fixed release, so exposure reduction matters while maintainers assess next steps."
  - "Defenders should verify route configuration, static roots, process permissions, and observable denials rather than rely on package inventory alone."
sources:
  - title: "restify node-restify static.js serveStatic path traversal"
    publisher: "CVE Program · September 13, 2026"
    url: "https://raw.githubusercontent.com/CVEProject/cvelistV5/main/cves/2026/90xxx/CVE-2026-90494.json"
  - title: "restify"
    publisher: "npm · August 31, 2026"
    url: "https://www.npmjs.com/package/restify"
  - title: "Plugins API"
    publisher: "Restify · publication date not stated"
    url: "https://restify.com/docs/plugins-api/"
---

A new vulnerability record puts a familiar convenience feature under scrutiny: serving static files from an application process. CVE-2026-90494 describes a remotely reachable path-traversal weakness in Restify's `serveStatic` handler. The immediate defensive question is not simply whether Restify appears in a dependency list, but whether an exposed route can translate untrusted request paths into filesystem access.

## What the record confirms

The CVE Program record was published on September 13 and names `serveStatic` in `lib/plugins/static.js` as the affected function. It describes Restify through version 12.0.0 as affected and says the weakness can be reached remotely. The CNA assigned a CVSS 3.1 score of 5.3 and a CVSS 4.0 score of 6.9, both in the medium range, with confidentiality as the stated impact rather than integrity or availability.

Those facts define the limits of what defenders can responsibly conclude. The record does not document active exploitation, a confirmed fixed version, or a vendor-issued workaround. It also says the vendor was contacted but did not respond. That is a reason to manage exposure carefully, not a basis for claiming compromise or assuming every Restify service is exploitable in the same way.

The npm package page listed 12.0.0 as the current release when reviewed. Restify's own documentation explains that `serveStatic` is mapped to a route and configured with a filesystem directory. It also documents options that change whether the request path is appended and can restrict matching file names. Configuration therefore determines which applications have a meaningful exposure path.

## Inventory the route, not only the package

A software-composition scan can find Restify, but it cannot by itself show whether `serveStatic` is registered, reachable, or pointed at a sensitive directory. Teams should search application initialization and route-registration code for the handler, then connect each finding to its externally reachable hostname and path. Include generated configuration, internal services promoted through an ingress, and older applications that may not appear in the primary service catalogue.

For every match, record the configured static directory, the application's working directory, the route pattern, and whether request paths are appended. Verify these values in the running deployment rather than relying only on source defaults. Containers, process managers, and deployment scripts can change the working directory and therefore change the practical boundary around relative paths.

This review should also distinguish a package that is merely installed from a handler that actually serves files. That separation keeps emergency work focused while retaining a list of dormant dependencies for later removal or upgrade.

## Reduce reach while a fix is unresolved

Where static delivery is unnecessary, disable the route. Where it is required, place public assets in a dedicated directory containing no secrets, source maps, backups, configuration files, keys, or runtime state. Run the application identity with read access only to the exact content it must serve; filesystem permissions should remain a backstop if URL validation fails.

An ingress or reverse proxy can further restrict the public route to the expected path and file types. That control should be treated as temporary risk reduction, not proof that the underlying weakness has disappeared. Avoid improvised input filters whose decoding behavior may differ from the application. If static assets can be moved to a narrowly scoped web server or object store without disrupting the service, that architectural separation removes the application runtime from the file-serving decision.

Because the public record names no fixed release, teams should monitor the Restify repository, npm release channel, and CVE record for a maintainer update. Test any eventual release against real route behavior before broad deployment.

## Make containment observable

After changing exposure, verify from outside the trust boundary that only intended assets are returned. Monitor for unusual requests and repeated denials on static routes, but do not treat the absence of alerts as evidence of safety. Confirm that the process cannot read files outside the static root and that production images do not contain credentials or unnecessary build artifacts.

The durable lesson is simple: a static directory is a security boundary, not just a convenience setting. Dependency identification begins the response; route-level reachability, filesystem least privilege, and deployment-level verification complete it.
