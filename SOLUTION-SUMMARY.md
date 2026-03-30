# Git Graph Merge Commit 渲染问题 - 解决方案总结

## 问题描述

在使用 `@gitgraph/react` 显示 Git 提交历史时，merge commit（合并提交）显示为 `[object Object]`，而不是自定义的格式：`[分支标签] [hash] [作者名]: [提交信息] ([时间])`。

普通提交可以正常显示自定义格式，但 merge commit 不行。

## 根本原因

`@gitgraph/core` v1.5.0 库中的 `BranchUserApi._commitWithParents()` 方法在创建 Commit 对象时，没有正确保留 `renderMessage` 属性。

虽然 API 签名支持在 `commitOptions` 中传递 `renderMessage`，但在实际的对象合并过程中，这个属性可能被丢失或覆盖。

## 解决方案

### 1. 使用 patch-package 修复库

我们创建了一个 patch 来修复 `@gitgraph/core` 库：

**修改位置**: `node_modules/@gitgraph/core/lib/user-api/branch-user-api.js`

**修改内容**:
```javascript
// 原代码
const { tag } = options, commitOptions = __rest(options, ["tag"]);
const commit = new commit_1.Commit(Object.assign({ 
    hash: this._graph.generateCommitHash(), 
    author: ..., 
    subject: ... 
}, commitOptions, { 
    parents, 
    style: this._getCommitStyle(options.style) 
}));

// 修复后
const { tag } = options, commitOptions = __rest(options, ["tag"]);
// 显式提取并保留 render 函数
const { renderMessage, renderDot, renderTooltip } = commitOptions;
const commit = new commit_1.Commit(Object.assign({ 
    hash: this._graph.generateCommitHash(), 
    author: ..., 
    subject: ... 
}, commitOptions, { 
    parents, 
    style: this._getCommitStyle(options.style),
    renderMessage,    // 显式添加
    renderDot,        // 显式添加
    renderTooltip     // 显式添加
}));
```

### 2. Patch 文件

Patch 已保存在 `patches/@gitgraph+core+1.5.0.patch`，会在 `npm install` 后自动应用。

### 3. 自动应用

在 `package.json` 中添加了 `postinstall` 脚本：

```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

## 使用方法

### 安装依赖

```bash
npm install
```

Patch 会自动应用，无需手动操作。

### 代码实现

在 `src/GitGraphManager.js` 中，merge commit 现在可以正确使用自定义渲染：

```javascript
branch.merge(branchMap[mergedBranchName], {
  commitOptions: {
    hash: commit.commit.short,
    subject: String(commit.subject || ''),
    author: `${commit.author.name} <${commit.author.email}>`,
    renderMessage: renderCommit => {
      // 自定义 SVG 渲染
      // 格式: [分支标签] [hash] [作者名]: [提交信息] ([时间])
      return (
        <g>
          <rect ... />  {/* 分支标签背景 */}
          <text ...>{branchName}</text>  {/* 分支名 */}
          <text ...>{hashShort}</text>   {/* hash */}
          <text ...>{authorName}:</text> {/* 作者 */}
          <text ...>{messageText}</text> {/* 提交信息和时间 */}
        </g>
      );
    }
  }
});
```

## 效果

✅ **普通提交**: 显示自定义格式  
✅ **Merge 提交**: 显示自定义格式  
✅ **分支关系**: 保留可视化的 merge 线条  
✅ **统一样式**: 所有提交使用一致的格式

## 相关文件

- `patches/@gitgraph+core+1.5.0.patch` - Patch 文件
- `patches/README.md` - Patch 说明文档
- `MERGE-COMMIT-RENDERING.md` - 详细技术文档
- `src/GitGraphManager.js` - 主要实现代码
- `src/GitDataFetcher.js` - GitHub API 数据获取
- `package.json` - 添加了 postinstall 脚本

## 维护说明

### 更新 @gitgraph/core 版本

如果需要升级 `@gitgraph/core` 到新版本：

1. 更新 `package.json` 中的版本号
2. 运行 `npm install`
3. 如果 patch 应用失败，需要手动重新应用修复
4. 运行 `npx patch-package @gitgraph/core` 创建新的 patch

### 验证修复

运行应用后，检查：
- Merge commit 是否显示正确的格式
- 是否有 merge 线条连接分支
- 控制台是否有错误信息

## 技术细节

### 为什么原代码失败

JavaScript 的 `Object.assign()` 在多次 spread 操作时，后面的对象会覆盖前面的属性。虽然 `renderMessage` 不应该被覆盖（因为它不在最后的对象中），但可能存在以下问题：

1. `__rest` 操作符可能没有正确提取所有属性
2. `Object.assign` 对 undefined 值的处理可能导致属性丢失
3. 库的某些内部逻辑可能过滤掉了某些属性

### 为什么修复有效

通过显式提取 `renderMessage`、`renderDot` 和 `renderTooltip`，然后在最后的对象中重新添加它们，我们确保这些属性一定会传递给 Commit 构造函数，不会在中间过程中丢失。

## 依赖版本

- `@gitgraph/core`: 1.5.0 (已 patch)
- `@gitgraph/react`: 1.6.0
- `patch-package`: 8.0.1
- `postinstall-postinstall`: 2.1.0

## 参考资料

- [patch-package GitHub](https://github.com/ds300/patch-package)
- [gitgraph.js GitHub](https://github.com/nicoespeon/gitgraph.js)
- [@gitgraph/core npm](https://www.npmjs.com/package/@gitgraph/core)
