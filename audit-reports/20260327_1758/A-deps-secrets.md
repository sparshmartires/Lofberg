# A -- Dependencies & Secrets Analysis

Date: 2026-03-27

## Summary

The backend (.NET) has zero known NuGet vulnerabilities. The frontend (npm) has 9 vulnerable packages (4 high, 5 moderate, 0 critical), all related to ReDoS, prototype pollution, or DoS vectors in transitive dependencies -- the only direct vulnerable dependency is `exceljs`. Several backend packages are a full major version behind (9.x vs 10.x) due to the .NET 10 release cycle, and a few frontend packages have crossed major version boundaries. No hardcoded secrets were detected in either repository.

## Findings

| # | Severity | Repo | File / Package | Direct? | Description |
|---|----------|------|----------------|---------|-------------|
| 1 | HIGH | FE | flatted (<=3.4.1) | No | Unbounded recursion DoS in `parse()` + Prototype Pollution (GHSA-25h7-pfq9-p65f, GHSA-rf6f-7fwh-wjgh). Fix available via `npm audit fix`. |
| 2 | HIGH | FE | minimatch (<=10.0.2) | No | Multiple ReDoS advisories via wildcards and extglobs (GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74). Fix requires `exceljs` downgrade to 4.1.1 (semver-major). |
| 3 | HIGH | FE | picomatch (<=2.3.1, 4.0.0-4.0.3) | No | ReDoS via extglob quantifiers + method injection in POSIX classes (GHSA-c2c7-rcm5-vvqj, GHSA-3v7f-55p6-f55p). Fix available via `npm audit fix`. |
| 4 | HIGH | FE | svgo (3.0.0-3.3.2) | No | Billion Laughs DoS through entity expansion in DOCTYPE (GHSA-xpqw-6gx7-v673). Fix available via `npm audit fix`. |
| 5 | MODERATE | FE | exceljs (>=4.2.0) | **Yes** | Affected transitively through archiver -> readdir-glob -> minimatch chain. Fix requires downgrade to 4.1.1 (semver-major breaking change). |
| 6 | MODERATE | FE | ajv (<6.14.0) | No | ReDoS when using `$data` option (GHSA-2g4f-4pwh-qvx6). Fix available. |
| 7 | MODERATE | FE | brace-expansion (<5.0.5) | No | Zero-step sequence causes process hang and memory exhaustion (GHSA-f886-m6hf-6m8v). |
| 8 | MODERATE | FE | archiver (>=5.0.0) | No | Transitive via readdir-glob. Chains into exceljs. |
| 9 | MODERATE | FE | readdir-glob (<=2.0.3) | No | Transitive via minimatch. |
| 10 | OUTDATED >1 MAJOR | BE | Microsoft.AspNetCore.Authentication.JwtBearer | Yes | 9.0.0 -> 10.0.5 (tied to .NET 10 framework upgrade) |
| 11 | OUTDATED >1 MAJOR | BE | Microsoft.EntityFrameworkCore.SqlServer | Yes | 9.0.12 -> 10.0.5 |
| 12 | OUTDATED >1 MAJOR | BE | Microsoft.EntityFrameworkCore.Tools | Yes | 9.0.12 -> 10.0.5 |
| 13 | OUTDATED >1 MAJOR | BE | Microsoft.EntityFrameworkCore.Design | Yes | 9.0.12 -> 10.0.5 |
| 14 | OUTDATED >1 MAJOR | BE | Microsoft.AspNetCore.Identity.EntityFrameworkCore | Yes | 9.0.12 -> 10.0.5 |
| 15 | OUTDATED >1 MAJOR | BE | Microsoft.Extensions.Configuration.EnvironmentVariables | Yes | 9.0.12 -> 10.0.5 |
| 16 | OUTDATED >1 MAJOR | BE | Microsoft.Extensions.Logging.Abstractions | Yes | 9.0.12 -> 10.0.5 |
| 17 | OUTDATED >1 MAJOR | BE | PuppeteerSharp | Yes | 21.1.0 -> 24.40.0 (3 major versions behind) |
| 18 | OUTDATED >1 MAJOR | BE | coverlet.collector | Yes | 6.0.4 -> 8.0.1 (test dependency) |
| 19 | OUTDATED >1 MAJOR | BE | Microsoft.NET.Test.Sdk | Yes | 17.12.0 -> 18.3.0 (test dependency) |
| 20 | OUTDATED >1 MAJOR | BE | xunit.runner.visualstudio | Yes | 2.8.2 -> 3.1.5 (test dependency) |
| 21 | OUTDATED >1 MAJOR | BE | Microsoft.AspNetCore.Mvc.Testing | Yes | 9.0.0 -> 10.0.5 (test dependency) |
| 22 | OUTDATED >1 MAJOR | FE | lucide-react | Yes | 0.563.0 -> 1.7.0 (icons library, 0.x to 1.x) |
| 23 | OUTDATED >1 MAJOR | FE | typescript | Yes | 5.9.3 -> 6.0.2 |

## Metrics

- Critical CVE count: 0
- High CVE count: 4 (all frontend, all transitive)
- Moderate CVE count: 5 (frontend; 1 direct -- exceljs)
- Total vulnerable packages: 9 (all npm; 0 NuGet)
- Packages >1 major version behind: 14 (12 backend, 2 frontend)
- Suspected hardcoded secrets: 0

## Top Recommendations

1. **Run `npm audit fix` in the frontend repo** -- this will resolve flatted, picomatch, svgo, and ajv automatically (4 of 9 vulnerable packages including 3 high-severity).
2. **Evaluate the exceljs minimatch/archiver chain** -- the remaining 5 vulnerabilities all trace back to `exceljs >=4.2.0`. The automated fix requires downgrading to 4.1.1 (breaking). Assess whether the project can accept the downgrade or if an alternative XLSX library should be used.
3. **Plan the .NET 10 framework upgrade** -- 8 production backend packages are pinned to the 9.x line while 10.x is available. This is expected for a .NET 9 project but should be scheduled to stay within the Microsoft support window.
4. **Upgrade PuppeteerSharp (21 -> 24)** -- this package is 3 major versions behind, the largest gap in the backend. Newer versions include Chromium compatibility fixes and security patches for the headless browser.
5. **Upgrade frontend TypeScript to 6.x** -- TypeScript 6.0 is now available; plan the migration to stay current with type-checking improvements and language features.
