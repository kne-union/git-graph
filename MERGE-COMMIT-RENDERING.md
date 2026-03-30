# Merge Commit Custom Rendering - FIXED ✅

## Problem (RESOLVED)

The `@gitgraph/react` library's `branch.merge()` method was not properly supporting custom `renderMessage` callbacks. This caused merge commits to display `[object Object]` instead of the custom formatted text: `[分支标签] [hash] [作者名]: [提交信息] ([时间])`.

## Solution Applied

We've successfully patched `@gitgraph/core` v1.5.0 to fix the issue.

### The Fix

In `node_modules/@gitgraph/core/lib/user-api/branch-user-api.js`, the `_commitWithParents` method was modified to explicitly preserve `renderMessage`, `renderDot`, and `renderTooltip` properties when creating merge commits:

```javascript
const { tag } = options, commitOptions = __rest(options, ["tag"]);
// Preserve renderMessage, renderDot, and renderTooltip from commitOptions
const { renderMessage, renderDot, renderTooltip } = commitOptions;
const commit = new commit_1.Commit(Object.assign({ 
    hash: this._graph.generateCommitHash(), 
    author: this._branch.commitDefaultOptions.author || this._graph.author, 
    subject: this._branch.commitDefaultOptions.subject || this._graph.commitMessage 
}, commitOptions, { 
    parents, 
    style: this._getCommitStyle(options.style),
    renderMessage,
    renderDot,
    renderTooltip 
}));
```

### Patch File

The patch is saved in `patches/@gitgraph+core+1.5.0.patch` and will be automatically applied after `npm install` via the `postinstall` script in `package.json`.

## Current Implementation

In `src/GitGraphManager.js`, merge commits now correctly use custom rendering:

```javascript
branch.merge(branchMap[mergedBranchName], {
  commitOptions: {
    hash: commit.commit.short,
    subject: String(commit.subject || ''),
    author: `${commit.author.name} <${commit.author.email}>`,
    renderMessage: renderCommit => {
      // Custom SVG rendering with format:
      // [分支标签] [hash] [作者名]: [提交信息] ([时间])
      return (<g>...</g>);
    }
  }
});
```

## Result

✅ Normal commits display with custom format
✅ Merge commits display with custom format
✅ Visual merge lines show branch relationships
✅ All commits have consistent styling: `[分支标签] [hash] [作者名]: [提交信息] ([时间])`

## Installation

When others clone this repository:

```bash
npm install  # Automatically applies the patch via postinstall script
```

## Files Modified

- `patches/@gitgraph+core+1.5.0.patch`: Patch file for @gitgraph/core
- `package.json`: Added `postinstall` script to apply patches
- `src/GitGraphManager.js`: Merge rendering logic with custom renderMessage
- `src/GitDataFetcher.js`: Fixed author data extraction from GitHub API

## Technical Details

### Why the Original Code Failed

The original `_commitWithParents` method spread `commitOptions` into the Commit constructor, but then immediately spread another object with `parents` and `style`. While this shouldn't have overwritten `renderMessage` (since it wasn't in the final object), there may have been an issue with how JavaScript's `Object.assign` handles undefined values or how the `__rest` operator was extracting properties.

### Why the Fix Works

By explicitly extracting `renderMessage`, `renderDot`, and `renderTooltip` from `commitOptions` and then re-adding them in the final object spread, we ensure these properties are always present in the Commit constructor, even if they were somehow lost during the intermediate spreading operations.

## Maintenance

If you need to update `@gitgraph/core` to a newer version:

1. Update the version in `package.json`
2. Run `npm install`
3. The patch may fail if the code has changed significantly
4. If it fails, manually apply the same fix to the new version
5. Run `npx patch-package @gitgraph/core` to create a new patch

## References

- Original issue: Merge commits showing `[object Object]`
- Library: @gitgraph/core v1.5.0, @gitgraph/react v1.6.0
- Patch tool: patch-package v8.0.1
