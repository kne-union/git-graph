# Patches

This directory contains patches for npm packages that are automatically applied after `npm install`.

## @gitgraph/core v1.5.0

**File**: `@gitgraph+core+1.5.0.patch`

**Issue**: The `branch.merge()` method was not properly passing `renderMessage` callbacks to merge commits, causing them to display `[object Object]` instead of custom rendered content.

**Fix**: Modified `_commitWithParents` method in `lib/user-api/branch-user-api.js` to explicitly preserve `renderMessage`, `renderDot`, and `renderTooltip` properties when creating commits.

**Impact**: 
- ✅ Merge commits now support custom `renderMessage` rendering
- ✅ Visual merge lines are preserved
- ✅ Consistent styling across all commit types

## How Patches Work

Patches are managed by [patch-package](https://github.com/ds300/patch-package):

1. Patches are automatically applied after `npm install` via the `postinstall` script
2. If you need to modify a patch:
   - Edit the file in `node_modules/`
   - Run `npx patch-package <package-name>`
   - Commit the updated patch file

## Creating New Patches

```bash
# 1. Make changes to files in node_modules/
# 2. Create the patch
npx patch-package <package-name>

# 3. Commit the patch file
git add patches/
git commit -m "Add patch for <package-name>"
```
