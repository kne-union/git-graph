# Gitgraph Patches

This directory contains patches for @gitgraph/core to support custom renderMessage in merge commits.

## Issue

The @gitgraph/core library (v1.5.0) does not properly pass `renderMessage` from `commitOptions` when creating merge commits via `branch.merge()`.

## Solution

We use `patch-package` to patch the `@gitgraph/core` library's `branch-user-api.js` file to ensure `renderMessage` is preserved when creating merge commits.

## How to Apply

1. Install patch-package: `npm install --save-dev patch-package postinstall-postinstall`
2. Add to package.json scripts: `"postinstall": "patch-package"`
3. Make changes to node_modules/@gitgraph/core/lib/user-api/branch-user-api.js
4. Run: `npx patch-package @gitgraph/core`

This will create a patch file in `patches/` directory that will be automatically applied after `npm install`.
