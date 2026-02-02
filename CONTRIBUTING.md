# Contributing

We appreciate your contributions. This document outlines how to contribute, set up your environment, and follow our workflow to keep the project healthy and welcoming.

## Code of Conduct

We ask all contributors to adhere to a respectful, inclusive code of conduct. See CODE_OF_CONDUCT.md for details. If you have concerns, contact the maintainers.

## How to contribute

- Report issues: bug reports, feature requests, or improvements via GitHub Issues.
- Propose changes: open a PR with a clear description of the problem and the solution.
- Start small: consider fixing a small bug or adding a test to begin.

## Getting started

1. Fork the repository (if required) and clone it locally.
2. Install dependencies: run `npm install`.
3. If the project uses a specific Node version, ensure you are on that version (e.g., Node.js 16+).
4. Run the build or tests locally to verify your environment works:
   - `npm test` to run tests
   - `npm run lint` to lint the codebase
   - `npm run build` to build (if available)
5. Make your changes, add tests if applicable, and run the checks again.

## Testing locally

- Unit tests: `npm test`
- Lint/format: `npm run lint` and `npm run format`

## Branching and commits

- Create a feature/fix branch: `git checkout -b feature/your-feature-name`
- Commit messages should be descriptive and follow conventional commits when possible:
  - feat: introduce new feature
  - fix: fix a bug
  - docs: update documentation
  - style: formatting changes
  - test: add or update tests
  - chore: build, tool changes, etc.
- Push the branch and open a PR against the main branch.

## How to run and validate PRs

- Ensure tests pass; fix any lint or type errors locally first.
- Include a short PR description covering what changed and why.
- If relevant, include how to test the feature manually.

## Documentation and examples

- Update docs and add examples where helpful to demonstrate usage and edge cases.
- Maintain consistency with existing patterns and API shapes.

## Security

- Do not commit secrets. If you discover a vulnerability, report it responsibly via the project’s disclosure process.
