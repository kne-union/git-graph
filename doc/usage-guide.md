# GitDataFetcher 使用指南

## 概述

`GitDataFetcher` 组件提供了一个完整的 UI 界面，让用户可以从 GitHub 仓库获取 Git 数据并可视化。

## 基础用法

```jsx
import { GitDataFetcher } from '@kne/git-graph';
import GitGraphManager from '@kne/git-graph';

<GitDataFetcher defaultRepo="https://github.com/owner/repo">
  {(gitData) => <GitGraphManager data={gitData} />}
</GitDataFetcher>
```

## Props

### defaultRepo

- **类型**: `string`
- **默认值**: `'https://github.com/kne-union/components-core'`
- **描述**: 组件加载时默认获取的 GitHub 仓库地址

### defaultMaxCommits

- **类型**: `number`
- **默认值**: `0`
- **描述**: 默认获取的最大提交数量
  - `0`: 获取所有提交（最多 10000 个，受 GitHub API 限制）
  - `> 0`: 获取指定数量的提交（例如：100、500、1000）

### children

- **类型**: `function(gitData: Object): ReactNode`
- **必填**: 是
- **描述**: 渲染函数，接收获取到的 Git 数据作为参数

## 使用示例

### 示例 1：获取所有提交

```jsx
<GitDataFetcher defaultRepo="https://github.com/facebook/react">
  {(gitData) => <GitGraphManager data={gitData} />}
</GitDataFetcher>
```

### 示例 2：只获取最近 100 个提交

```jsx
<GitDataFetcher 
  defaultRepo="https://github.com/facebook/react"
  defaultMaxCommits={100}
>
  {(gitData) => <GitGraphManager data={gitData} />}
</GitDataFetcher>
```

### 示例 3：获取 500 个提交

```jsx
<GitDataFetcher 
  defaultRepo="https://github.com/vuejs/vue"
  defaultMaxCommits={500}
>
  {(gitData) => <GitGraphManager data={gitData} />}
</GitDataFetcher>
```

## UI 功能

### 1. 仓库地址输入

- 用户可以在输入框中输入任意 GitHub 仓库地址
- 支持按回车键快速获取
- 格式：`https://github.com/owner/repo`

### 2. 提交数量设置

- 用户可以动态设置要获取的提交数量
- 输入 `0` 或留空：获取所有提交（最多 10000）
- 输入具体数字：获取指定数量的提交
- 实时显示将要获取的数量

### 3. 进度显示

获取数据时会显示详细的进度信息：

1. "正在获取仓库信息..."
2. "正在获取分支列表..."
3. "正在获取提交历史..." + 实时数量
4. "正在处理数据..."
5. "完成！"

### 4. 数据统计

数据加载完成后，会在顶部显示：
- 已加载的提交数量
- 已加载的分支数量

## 性能建议

### 小型仓库（< 1000 个提交）

```jsx
<GitDataFetcher defaultMaxCommits={0}>
  {/* 获取所有提交 */}
</GitDataFetcher>
```

### 中型仓库（1000 - 5000 个提交）

```jsx
<GitDataFetcher defaultMaxCommits={500}>
  {/* 获取最近 500 个提交 */}
</GitDataFetcher>
```

### 大型仓库（> 5000 个提交）

```jsx
<GitDataFetcher defaultMaxCommits={100}>
  {/* 获取最近 100 个提交 */}
</GitDataFetcher>
```

## 注意事项

### GitHub API 限制

1. **速率限制**
   - 未认证：60 次/小时
   - 已认证：5000 次/小时

2. **数据量限制**
   - 最多获取 10000 个提交
   - 每页最多 100 条记录

### 获取时间

获取时间取决于：
- 仓库大小
- 网络速度
- 提交数量

参考时间：
- 100 个提交：约 2-3 秒
- 500 个提交：约 5-10 秒
- 1000 个提交：约 10-20 秒
- 10000 个提交：约 1-2 分钟

### 最佳实践

1. **首次加载**：建议设置较小的数量（如 100）
2. **按需加载**：用户可以根据需要调整数量后重新获取
3. **大型仓库**：避免一次性获取所有提交，建议分批获取

## 错误处理

组件会自动处理以下错误：

1. **无效的 URL 格式**
   ```
   Invalid GitHub URL format. Expected: https://github.com/owner/repo
   ```

2. **仓库不存在**
   ```
   Failed to fetch repo info: 404 Not Found
   ```

3. **网络错误**
   - 显示具体的错误信息

4. **API 速率限制**
   ```
   Failed to fetch: 403 Forbidden
   ```

## 高级用法

### 使用 fetchGitDataFromGitHub 函数

如果需要更多控制，可以直接使用底层函数：

```jsx
import { fetchGitDataFromGitHub } from '@kne/git-graph';

async function loadData() {
  const data = await fetchGitDataFromGitHub(
    'https://github.com/owner/repo',
    {
      maxCommits: 100,
      onProgress: (progress) => {
        console.log(progress.message);
      }
    }
  );
  
  console.log(`获取了 ${data.commits.length} 个提交`);
}
```

### 参数说明

- `repoUrl`: GitHub 仓库地址
- `options.maxCommits`: 最大提交数量（0 = 全部）
- `options.onProgress`: 进度回调函数

### 进度回调

```javascript
onProgress: ({ message, current, total }) => {
  console.log(`${message} (${current}/${total})`);
}
```

## 常见问题

### Q: 为什么最多只能获取 10000 个提交？

A: 这是 GitHub API 的限制。如需获取更多，需要使用 GraphQL API 或 Git 命令行工具。

### Q: 如何提高获取速度？

A: 
1. 减少获取的提交数量
2. 使用 GitHub Token 认证（提高速率限制）
3. 缓存已获取的数据

### Q: 可以获取私有仓库吗？

A: 目前只支持公开仓库。私有仓库需要添加认证 Token。

### Q: 如何添加认证 Token？

A: 需要修改 `fetchGitDataFromGitHub` 函数，在请求头中添加：

```javascript
const headers = {
  'Authorization': `token YOUR_GITHUB_TOKEN`
};

fetch(url, { headers });
```
