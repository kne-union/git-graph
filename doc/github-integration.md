# GitHub 集成说明

## 概述

`@kne/git-graph` 现在支持直接从 GitHub 仓库获取真实的 Git 数据，无需手动准备 mock 数据。

## 使用方式

### 方式一：使用 GitDataFetcher 组件

最简单的方式，提供了完整的 UI 交互：

```jsx
import { GitDataFetcher } from '@kne/git-graph';
import GitGraphManager from '@kne/git-graph';

function App() {
  return (
    <div style={{ height: '700px' }}>
      <GitDataFetcher defaultRepo="https://github.com/kne-union/components-core">
        {(gitData) => (
          <GitGraphManager 
            data={gitData}
            onCommitSelect={(commit) => console.log(commit)}
            onBranchSelect={(branch) => console.log(branch)}
          />
        )}
      </GitDataFetcher>
    </div>
  );
}
```

**特性：**
- 提供输入框，用户可以输入任意 GitHub 仓库地址
- 自动显示加载状态
- 错误处理和提示
- 支持按回车键快速获取

### 方式二：使用 fetchGitDataFromGitHub 函数

适合需要自定义逻辑的场景：

```jsx
import { fetchGitDataFromGitHub } from '@kne/git-graph';
import GitGraphManager from '@kne/git-graph';
import { useState, useEffect } from 'react';

function App() {
  const [gitData, setGitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGitDataFromGitHub(
          'https://github.com/kne-union/components-core'
        );
        setGitData(data);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!gitData) return <div>Failed to load data</div>;

  return <GitGraphManager data={gitData} />;
}
```

## GitHub API 说明

### 获取的数据

组件会从 GitHub API 获取以下信息：

1. **分支列表** (`/repos/:owner/:repo/branches`)
   - 获取所有分支（分页获取）
   - 包含分支名称和最新提交哈希

2. **仓库信息** (`/repos/:owner/:repo`)
   - 获取默认分支名称

3. **提交历史** (`/repos/:owner/:repo/commits`)
   - 获取所有提交（分页获取，最多 10000 个）
   - 包含作者、提交信息、父提交等
   - 显示实时进度

### 数据转换

GitHub API 返回的数据会被转换为组件所需的格式：

```javascript
{
  repo: "owner/repo",
  timestamp: "2026-03-27T10:00:00.000Z",
  branches: [
    { name: "main", isCurrent: true },
    { name: "develop", isCurrent: false }
  ],
  commits: [
    {
      commit: { long: "full-sha", short: "short-sha" },
      author: { name: "...", email: "...", date: "..." },
      subject: "commit message",
      body: "commit body",
      parents: ["parent-sha"],
      branches: ["main"],
      primaryBranch: "main",
      isMerge: false,
      lane: 0
    }
  ],
  branchRefs: {
    "main": "abc1234",
    "develop": "def5678"
  }
}
```

## 限制和注意事项

### GitHub API 速率限制

- **未认证请求**: 60 次/小时/IP
- **认证请求**: 5000 次/小时（需要添加 token）

如果需要更高的速率限制，可以修改 `fetchGitDataFromGitHub` 函数添加认证：

```javascript
const headers = {
  'Authorization': `token YOUR_GITHUB_TOKEN`
};

const response = await fetch(url, { headers });
```

### 仓库访问权限

- 仅支持**公开仓库**
- 私有仓库需要提供有效的访问 token

### 数据量限制

- 分支：获取所有分支（无限制）
- 提交：获取所有提交，最多 10000 个（GitHub API 限制）
- 每页 100 条记录，自动分页获取

如需突破 10000 个提交的限制，需要使用 GraphQL API 或 Git 命令行工具。

## 支持的 URL 格式

以下格式的 GitHub URL 都被支持：

- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`
- `http://github.com/owner/repo`

## 错误处理

组件会处理以下错误情况：

1. **无效的 URL 格式**
   - 错误信息：`Invalid GitHub URL format`

2. **仓库不存在或无权访问**
   - 错误信息：`Failed to fetch repo info: 404 Not Found`

3. **网络错误**
   - 显示具体的网络错误信息

4. **API 速率限制**
   - 错误信息：`Failed to fetch: 403 Forbidden`

## 示例仓库

以下是一些可以用来测试的公开仓库：

- `https://github.com/kne-union/components-core`
- `https://github.com/facebook/react`
- `https://github.com/vuejs/vue`
- `https://github.com/angular/angular`

## 未来改进

可能的改进方向：

1. 支持 GitHub 认证（提高速率限制）
2. 支持私有仓库
3. 支持分页加载更多提交
4. 缓存机制（减少 API 调用）
5. 支持其他 Git 托管平台（GitLab、Bitbucket 等）
