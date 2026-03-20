## Summary

The project has 6 vulnerable packages (4 high, 2 moderate, 0 critical) across 763 total dependencies. The most urgent issue is the `xlsx` package (direct dependency) which has 2 high-severity vulnerabilities with no fix available -- the package appears unmaintained. The `next` framework (direct dependency, v16.1.6) has 5 known vulnerabilities including CSRF bypass and HTTP request smuggling, all fixable by upgrading to 16.2.0. The remaining 4 vulnerable packages (`minimatch`, `flatted`, `svgo`, `ajv`) are transitive dependencies with available fixes. No packages are more than 1 major version behind, and no hardcoded secrets were detected in the codebase.

## Findings

| Severity | File / Area | Description |
|----------|-------------|-------------|
| High | `xlsx` (direct) | Prototype Pollution (GHSA-4r6h-8v6p-xvw6, CVSS 7.8) and ReDoS (GHSA-5pgg-2g8v-p4x9, CVSS 7.5). **No fix available** -- the npm package has no patched version. Used for CSV/Excel parsing in report data upload. |
| High | `minimatch` (transitive, via `@typescript-eslint/typescript-estree`) | 3 distinct ReDoS vulnerabilities (GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74, CVSS 7.5). Fix available by updating to >=3.1.4 or >=9.0.7. |
| High | `flatted` (transitive) | Unbounded recursion DoS in `parse()` revive phase (GHSA-25h7-pfq9-p65f, CVSS 7.5). Fix available by updating to >=3.4.0. |
| High | `svgo` (transitive) | Billion Laughs DoS via entity expansion in DOCTYPE (GHSA-xpqw-6gx7-v673, CVSS 7.5). Fix available by updating to >=3.3.3. |
| Moderate | `next` v16.1.6 (direct) | 5 vulnerabilities: CSRF bypass in Server Actions (GHSA-mq59-m269-xvcx), HMR WebSocket CSRF bypass (GHSA-jcc7-9wpm-mj36, low), unbounded image cache growth (GHSA-3x4c-7xq6-9pq8), postponed resume buffering DoS (GHSA-h27x-g6w4-24gq), HTTP request smuggling in rewrites (GHSA-ggv3-7p47-pfv8). All fixed in 16.1.7+; latest is 16.2.0. |
| Moderate | `ajv` (transitive) | ReDoS when using `$data` option (GHSA-2g4f-4pwh-qvx6). Fix available by updating to >=6.14.0. |
| Info | `@types/node` (dev) | Current v20, latest v25 (5 major versions behind). However, this is pinned to the 20.x range via `wanted` and is a dev-only type definition package -- low risk. |
| Info | Secrets scan | No hardcoded secrets, API keys, or credentials detected in the codebase. |

## Metrics

- Critical CVE count: 0
- High CVE count: 4
- Total vulnerable packages: 6
- Packages >1 major behind: 0
- Suspected hardcoded secrets: 0

## Top Recommendations

1. **Replace `xlsx` with a maintained alternative** (e.g., `SheetJS` community edition, `exceljs`, or `papaparse` for CSV-only). The package has 2 high-severity vulnerabilities with no fix available, and it processes user-uploaded files, making it an active attack surface.
2. **Upgrade `next` from 16.1.6 to 16.2.0** to resolve all 5 known vulnerabilities including CSRF bypass and HTTP request smuggling. This is a non-breaking minor version bump (`fixAvailable.isSemVerMajor: false`).
3. **Run `npm audit fix`** to resolve the 4 transitive dependency vulnerabilities (`minimatch`, `flatted`, `svgo`, `ajv`) -- all have automated fixes available.
4. **Update TipTap packages** from 3.20.0 to 3.20.4 and **Tailwind CSS** from 4.1.18 to 4.2.2 to stay current on patch/minor releases.
5. **Establish a recurring dependency audit cadence** (e.g., weekly `npm audit` in CI) to catch new advisories before they accumulate.
