# 测试指南

## 快速测试

### 1. 启动开发服务器

```bash
npm start
```

这会同时启动：
- 库的监听构建 (watch mode)
- 文档服务器
- 示例应用

### 2. 访问示例应用

打开浏览器访问示例应用（通常是 http://localhost:3000）

### 3. 检查显示效果

查看 Git 提交图，确认：

#### ✅ 正常提交显示格式
```
[master] a1b2c3d Linzp: 更新组件版本 (2026-03-24 12:00)
```

#### ✅ Merge 提交显示格式
```
[master] d4e5f6g Linzp: Merge pull request #123 from branch-name (2026-03-24 13:00)
```

#### ✅ 分支关系可视化
- 应该能看到分支之间的连线
- Merge 提交应该有两条或多条线汇聚

### 4. 检查控制台

打开浏览器开发者工具的 Console 标签，查看：

```javascript
// 应该看到这些日志
Processing commit: a1b2c3d ...
  -> branchName: master, branch exists: true, isMerge: false
renderMessage called for commit: a1b2c3d

// 对于 merge 提交
Processing commit: d4e5f6g ...
  -> branchName: master, branch exists: true, isMerge: true
Attempting merge: { from: 'feature-branch', to: 'master', hash: 'd4e5f6g', subject: 'Merge...' }
renderMessage called for merge: d4e5f6g
Merge successful for: d4e5f6g
```

### 5. 验证 Patch

确认 patch 已应用：

```bash
# 查看 patch 文件
cat patches/@gitgraph+core+1.5.0.patch

# 验证修改已应用到 node_modules
grep -A 5 "Preserve renderMessage" node_modules/@gitgraph/core/lib/user-api/branch-user-api.js
```

应该看到：
```javascript
// Preserve renderMessage, renderDot, and renderTooltip from commitOptions
const { renderMessage, renderDot, renderTooltip } = commitOptions;
```

## 构建测试

### 构建库

```bash
npm run build:lib
```

检查输出：
- ✅ 无错误
- ✅ 生成 dist/ 目录
- ✅ 包含 locale 文件

### 构建示例

```bash
npm run build:example
```

或

```bash
cd example && npm run build
```

检查输出：
- ✅ 无错误
- ✅ 生成 example/build/ 目录

### 完整构建

```bash
npm run build
```

这会构建库、文档和示例。

## 问题排查

### 问题：Merge 提交仍显示 [object Object]

**检查**:
1. Patch 是否已应用？
   ```bash
   grep "Preserve renderMessage" node_modules/@gitgraph/core/lib/user-api/branch-user-api.js
   ```

2. 是否重新构建了库？
   ```bash
   npm run build:lib
   ```

3. 浏览器缓存是否清除？
   - 按 Ctrl+Shift+R (Windows/Linux) 或 Cmd+Shift+R (Mac) 强制刷新

### 问题：看不到 merge 线条

**检查**:
1. 数据中是否有 merge 提交？
   - 查看控制台日志中的 `isMerge: true`

2. 分支是否正确识别？
   - 查看 `Attempting merge` 日志
   - 确认 `from` 和 `to` 分支都存在

### 问题：控制台有错误

**常见错误**:

1. `Cannot merge to the deleted branch`
   - 被合并的分支不存在
   - 检查分支名称是否正确

2. `The branch called "xxx" is unknown`
   - 分支映射中缺少该分支
   - 检查 `branchMap` 是否包含所有需要的分支

3. `Error rendering commit`
   - renderMessage 函数中有错误
   - 检查 SVG 元素是否正确
   - 检查数据是否完整（author, subject 等）

## 性能测试

### 大量提交

测试加载大量提交（1000+）的性能：

```javascript
// 在 GitDataFetcher 中设置
defaultMaxCommits={1000}
```

检查：
- ✅ 页面响应速度
- ✅ 滚动流畅度
- ✅ 内存使用

### 多分支

测试多个分支（10+）的显示：

检查：
- ✅ 分支列表显示正确
- ✅ 分支颜色区分清晰
- ✅ Merge 线条不重叠

## 自动化测试

### Lint 检查

```bash
npm run test:lint
```

### 单元测试

```bash
npm run test:unit
```

### 构建测试

```bash
npm run test:build
```

## 浏览器兼容性

测试以下浏览器：
- ✅ Chrome (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ Edge (最新版)

## 移动端测试

使用浏览器开发者工具的设备模拟：
- ✅ 响应式布局
- ✅ 触摸滚动
- ✅ 文字可读性

## 报告问题

如果发现问题，请提供：
1. 浏览器版本
2. 控制台错误信息
3. 截图
4. 重现步骤
5. 数据样本（如果可能）
