# 修复日志 - Merge Commit 渲染问题

## 日期: 2026-03-30

## 问题

Merge commit 在 Git Graph 中显示为 `[object Object]`，而不是自定义的格式。

## 修复内容

### 1. 核心修复 - Patch @gitgraph/core

**文件**: `patches/@gitgraph+core+1.5.0.patch`

修改了 `@gitgraph/core` 库的 `BranchUserApi._commitWithParents()` 方法，确保 `renderMessage`、`renderDot` 和 `renderTooltip` 属性在创建 merge commit 时被正确保留。

**影响**: 
- Merge commit 现在支持自定义渲染
- 保留了分支 merge 的可视化线条
- 所有提交类型使用统一的渲染格式

### 2. 代码改进

**文件**: `src/GitGraphManager.js`

- 添加了详细的控制台日志用于调试
- 改进了 merge commit 的处理逻辑
- 添加了错误处理和回退机制
- 优化了分支识别算法

**文件**: `src/GitDataFetcher.js`

- 修复了从 GitHub API 获取 author 信息的逻辑
- 从 `commit.commit.author` 而不是 `commit.author` 获取实际的提交作者
- 添加了 null 安全检查和默认值

### 3. 配置更新

**文件**: `package.json`

- 添加了 `postinstall` 脚本自动应用 patches
- 安装了 `patch-package` 和 `postinstall-postinstall` 依赖

### 4. 文档

新增文档：
- `SOLUTION-SUMMARY.md` - 解决方案总结（中文）
- `MERGE-COMMIT-RENDERING.md` - 技术详细文档（英文）
- `TESTING.md` - 测试指南
- `patches/README.md` - Patch 说明
- `CHANGELOG-FIX.md` - 本文件

## 技术细节

### 问题根源

`@gitgraph/core` 的 `_commitWithParents` 方法在使用 `Object.assign` 合并对象时，`renderMessage` 等属性在某些情况下会丢失。

### 解决方案

显式提取并重新添加这些属性：

```javascript
const { renderMessage, renderDot, renderTooltip } = commitOptions;
const commit = new Commit(Object.assign(
  { /* defaults */ },
  commitOptions,
  { 
    parents, 
    style,
    renderMessage,  // 显式添加
    renderDot,
    renderTooltip
  }
));
```

## 测试结果

✅ 普通提交正确显示自定义格式  
✅ Merge 提交正确显示自定义格式  
✅ 分支 merge 线条正确显示  
✅ 所有提交样式统一  
✅ 构建成功无错误  

## 兼容性

- Node.js: 14+
- React: 18+
- 浏览器: Chrome, Firefox, Safari, Edge (最新版本)

## 依赖变更

新增开发依赖：
- `patch-package`: ^8.0.1
- `postinstall-postinstall`: ^2.1.0

## 安装说明

对于新的克隆或安装：

```bash
npm install  # Patch 会自动应用
npm run build
npm start
```

## 回滚方案

如果需要回滚此修复：

1. 删除 patch 文件：
   ```bash
   rm patches/@gitgraph+core+1.5.0.patch
   ```

2. 重新安装依赖：
   ```bash
   rm -rf node_modules
   npm install
   ```

3. 恢复代码到之前的版本

## 后续工作

### 可选改进

1. **提交给上游**: 可以将此修复提交给 `gitgraph.js` 项目
   ```bash
   npx patch-package @gitgraph/core --create-issue
   ```

2. **性能优化**: 对于大量提交的场景，可以考虑虚拟滚动

3. **更多自定义**: 可以添加更多的自定义渲染选项
   - 自定义 dot 样式
   - 自定义 tooltip
   - 主题切换

### 维护注意事项

- 如果升级 `@gitgraph/core` 到新版本，需要重新创建 patch
- 定期检查上游是否已修复此问题
- 保持 patch 文件在版本控制中

## 相关 Issue

- 原始问题: Merge commit 显示 `[object Object]`
- 相关库: @gitgraph/core v1.5.0, @gitgraph/react v1.6.0

## 贡献者

- 问题发现: 用户反馈
- 问题分析: 代码审查和调试
- 解决方案: Patch @gitgraph/core
- 文档编写: 完整的技术文档和测试指南

## 参考资料

- [patch-package 文档](https://github.com/ds300/patch-package)
- [gitgraph.js 项目](https://github.com/nicoespeon/gitgraph.js)
- [@gitgraph/core API](https://www.npmjs.com/package/@gitgraph/core)
