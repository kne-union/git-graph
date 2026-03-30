# Custom @gitgraph/react

This is a customized version of @gitgraph/react to support custom `renderMessage` for merge commits.

## Changes Made

1. Modified `BranchUserApi.merge()` to properly pass `renderMessage` through `commitOptions`
2. All other functionality remains the same as the original library

## Original Library

- Package: @gitgraph/react v1.6.0
- License: MIT
- Repository: https://github.com/nicoespeon/gitgraph.js
