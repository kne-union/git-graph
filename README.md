# git-graph

### 描述

Git commit history visualization component, supporting branch visualization, merge operations, and internationalization

### 安装

```shell
npm i --save @kne/git-graph
```

### 概述

# Git Graph - Git 分支管理可视化组件

## 项目简介

Git 分支管理可视化组件，用于展示 Git 仓库的分支和提交历史。采用三栏布局设计：左侧分支列表、中间提交历史（Git Graph + 列表）、右侧提交详情，提供类似 GitHub 的用户体验。

## 主要特性

- 📊 三栏布局：分支列表 + 提交历史 + 提交详情
- 🖱️ 可拖拽面板：使用 antd Splitter 实现面板大小调整
- 🌳 使用 @gitgraph/react 绘制专业 Git Graph
- 🔍 支持提交筛选功能（按标题、作者搜索）
- 📁 显示变更文件列表（新增/修改/删除）
- 🎨 美观的 UI 设计，类似 GitHub 界面风格
- 🌍 支持国际化（中文/英文）
- 📦 开箱即用，配置简单

## 技术栈

- React 18.2.0
- antd (Splitter、Icon 等组件)
- @gitgraph/react (Git Graph 绘制)
- dayjs (时间处理)
- @kne/react-intl (国际化)
- SCSS 模块化样式

## 核心依赖

```json
{
  "@gitgraph/react": "^1.6.0",
  "@kne/react-intl": "^0.1.9",
  "dayjs": "^1.11.20"
}
```

## 快速开始

### 安装

```bash
npm install @kne/git-graph
```

### 基础使用

```jsx
import GitGraphManager from '@kne/git-graph';

function App() {
  return (
    <GitGraphManager 
      data={gitData}
      locale="zh-CN"
      onCommitSelect={(commit) => console.log(commit)}
      onBranchSelect={(branch) => console.log(branch)}
    />
  );
}
```

## 组件配置

### Props

|| 参数 | 类型 | 默认值 | 说明 |
||------|------|--------|------|
|| data | Object | - | Git 数据对象（包含分支和提交信息） |
|| locale | string | 'zh-CN' | 语言设置，支持 'zh-CN' 和 'en-US' |
|| onCommitSelect | Function | - | 点击提交时的回调函数 |
|| onBranchSelect | Function | - | 点击分支时的回调函数 |

## 数据格式

组件接受的 Git 数据格式：

```typescript
interface GitData {
  repo: string;
  timestamp: string;
  branches: Array<{
    name: string;
    isCurrent: boolean;
  }>;
  commits: Array<{
    commit: {
      long: string;
      short: string;
    };
    author: {
      name: string;
      email: string;
      date: string;
    };
    subject: string;
    body: string;
    parents: string[];
    branches: string[];
    primaryBranch: string;
    isMerge: boolean;
    lane: number;
  }>;
}
```

## 布局设计

```
┌──────────────┬──────────────────────────────┬──────────────────┐
│   Branches   │      Commit History          │   Commit Detail  │
│   (200px)    │  ┌─────────┬───────────────┐ │     (340px)      │
│              │  │Gitgraph │  Commit List  │ │                  │
│   LOCAL      │  │  Graph  │               │ │  Changed Files   │
│   - main     │  │  (64px) │   (flex-1)    │ │  Commit Details  │
│   - develop  │  │         │               │ │                  │
│              │  └─────────┴───────────────┘ │                  │
│   REMOTE     │                              │                  │
│   - origin/* │                              │                  │
└──────────────┴──────────────────────────────┴──────────────────┘
```

**面板特性：**
- 左侧面板：200px 默认宽度，可拖拽调整（150px - 300px）
- 右侧面板：340px 默认宽度，可拖拽调整（280px - 450px）
- 中间面板：自动填充剩余空间

## 国际化

支持中文和英文切换：

```jsx
// 中文
<GitGraphManager data={gitData} locale="zh-CN" />

// 英文
<GitGraphManager data={gitData} locale="en-US" />
```

## 开发命令

- `npm run start` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run build:lib` - 构建组件库
- `npm run test:lint` - 运行代码检查

## 项目结构

```
src/
├── index.js                # 主组件导出
├── GitGraphManager.js      # 主组件（带国际化）
├── withLocale.js           # 国际化高阶组件
├── style.module.scss       # 组件样式
├── components/
│   ├── BranchList.js       # 分支列表组件
│   ├── CommitHistory.js    # 提交历史组件
│   └── CommitDetail.js     # 提交详情组件
└── locale/                 # 国际化语言包
    ├── zh-CN.js
    └── en-US.js

doc/
├── api.md                  # API 文档
├── example.json            # 示例配置
├── base.js                 # 基础示例
└── summary.md              # 项目概述
```

## 注意事项

1. 组件依赖 React 18.2.0 或更高版本
2. 组件依赖 antd 5.x 或更高版本
3. 需要提供正确格式的 Git 数据
4. 建议在父容器中设置合适的高度（建议 600px 以上）
5. 提交数据应按时间倒序排列（最新的在前）

## 更新日志

### v0.1.0 (2026-03-27)

- 初始版本发布
- 实现三栏布局设计
- 使用 @gitgraph/react 绘制 Git Graph
- 支持分支选择和提交选择
- 支持提交筛选功能
- 支持国际化（中文/英文）
- 使用 antd Splitter 实现可拖拽面板


### 示例(全屏)

#### 示例代码

- 从 GitHub 获取数据
- 展示如何从 GitHub 仓库获取真实的 Git 数据并可视化，默认加载 kne-union/components-core 仓库
- _GitGraph(@kne/current-lib_git-graph)[import * as _GitGraph from "@kne/git-graph"],(@kne/current-lib_git-graph/dist/index.css),antd(antd)

```jsx
const { default: GitGraphManager, GitDataFetcher } = _GitGraph;
const { message } = antd;

const GitHubExample = () => {
  const handleCommitSelect = commit => {
    message.info(&#96;选中提交: ${commit.subject}&#96;);
  };

  const handleBranchSelect = branch => {
    message.info(&#96;选中分支: ${branch.name}&#96;);
  };
  return (
    <div style={{ height: '700px' }}>
      <GitDataFetcher 
        defaultRepo="https://github.com/kne-union/components-core"
        defaultMaxCommits={0}
      >
        {(gitData) => (
          <GitGraphManager 
            data={gitData} 
            onCommitSelect={handleCommitSelect} 
            onBranchSelect={handleBranchSelect} 
          />
        )}
      </GitDataFetcher>
    </div>
  );
};

render(<GitHubExample />);

```

- 使用 Mock 数据
- 展示GitGraphManager的基本使用方法，使用预定义的 mock 数据
- _GitGraph(@kne/current-lib_git-graph)[import * as _GitGraph from "@kne/git-graph"],(@kne/current-lib_git-graph/dist/index.css),antd(antd),_mockData(./doc/mockData.js)

```jsx
const { default: GitGraphManager } = _GitGraph;
const { Card, Space, Button, message } = antd;
const { useState } = React;
const { default: mockGitData } = _mockData;

const BaseExample = () => {
  const handleCommitSelect = commit => {
    message.info(&#96;选中提交: ${commit.subject}&#96;);
  };

  const handleBranchSelect = branch => {
    message.info(&#96;选中分支: ${branch.name}&#96;);
  };

  return (
    <div style={{ height: '600px' }}>
      <GitGraphManager data={mockGitData} onCommitSelect={handleCommitSelect} onBranchSelect={handleBranchSelect} />
    </div>
  );
};

render(<BaseExample />);

```

### API

# API 文档

## GitGraphManager 组件

Git 分支管理可视化组件，采用三栏布局：左侧分支列表、中间提交历史（Git Graph + 列表）、右侧提交详情。使用 antd Splitter 组件实现可拖拽调整大小的面板。

### 基础用法

```jsx
import GitGraphManager from '@kne/git-graph';

function App() {
  const handleCommitSelect = (commit) => {
    console.log('Selected commit:', commit);
  };

  const handleBranchSelect = (branch) => {
    console.log('Selected branch:', branch);
  };

  return (
    <GitGraphManager 
      data={gitData}
      locale="zh-CN"
      onCommitSelect={handleCommitSelect}
      onBranchSelect={handleBranchSelect}
    />
  );
}
```

### Props

#### data

- 类型: `Object`
- 必填: 是
- 描述: Git 数据对象，包含分支和提交信息

数据格式示例：

```json
{
  "repo": "repository-name",
  "timestamp": "2026-03-27T06:25:49.465Z",
  "branches": [
    {
      "name": "master",
      "isCurrent": false
    },
    {
      "name": "feature/branch",
      "isCurrent": true
    },
    {
      "name": "remotes/origin/master",
      "isCurrent": false
    }
  ],
  "commits": [
    {
      "commit": {
        "long": "完整哈希值",
        "short": "短哈希值"
      },
      "author": {
        "name": "作者名",
        "email": "邮箱",
        "date": "2026-03-27T06:25:49.465Z"
      },
      "subject": "提交主题",
      "body": "提交详情",
      "parents": ["父提交哈希1"],
      "branches": ["master", "feature"],
      "primaryBranch": "feature",
      "isMerge": false,
      "lane": 0
    }
  ]
}
```

#### locale

- 类型: `string`
- 默认值: `'zh-CN'`
- 描述: 语言设置，支持 `'zh-CN'`（中文）和 `'en-US'`（英文）

#### onCommitSelect

- 类型: `function(commit: Object)`
- 默认值: `undefined`
- 描述: 点击提交时的回调函数

#### onBranchSelect

- 类型: `function(branch: Object)`
- 默认值: `undefined`
- 描述: 点击分支时的回调函数

### 布局结构

组件采用三栏布局，使用 antd Splitter 实现可拖拽调整大小：

```
┌──────────────┬──────────────────────────────┬──────────────────┐
│   Branches   │      Commit History          │   Commit Detail  │
│   (200px)    │  ┌─────────┬───────────────┐ │     (340px)      │
│              │  │Gitgraph │  Commit List  │ │                  │
│   LOCAL      │  │  Graph  │               │ │  Changed Files   │
│   - main     │  │  (64px) │   (flex-1)    │ │  Commit Details  │
│   - develop  │  │         │               │ │                  │
│              │  └─────────┴───────────────┘ │                  │
│   REMOTE     │                              │                  │
│   - origin/* │                              │                  │
└──────────────┴──────────────────────────────┴──────────────────┘
```

### 子组件

组件内部包含三个子组件：

#### BranchList

分支列表组件，显示本地和远程分支。

**Props:**

|| 属性 | 类型 | 默认值 | 描述 |
||------|------|-------|------|
|| localBranches | Array | [] | 本地分支列表 |
|| remoteBranches | Array | [] | 远程分支列表 |
|| selectedBranch | Object | null | 当前选中的分支 |
|| onBranchClick | Function | - | 分支点击回调 |

#### CommitHistory

提交历史组件，包含 Git Graph 和提交列表。

**Props:**

|| 属性 | 类型 | 默认值 | 描述 |
||------|------|-------|------|
|| commits | Array | [] | 提交列表 |
|| selectedCommit | Object | null | 当前选中的提交 |
|| onCommitClick | Function | - | 提交点击回调 |
|| filterText | string | '' | 筛选文本 |
|| onFilterChange | Function | - | 筛选文本变化回调 |
|| gitgraphComponent | ReactNode | - | Gitgraph 组件实例 |

#### CommitDetail

提交详情组件，显示变更文件和提交信息。

**Props:**

|| 属性 | 类型 | 默认值 | 描述 |
||------|------|-------|------|
|| commit | Object | null | 选中的提交对象 |

### 数据结构说明

#### 分支数据字段

|| 字段 | 类型 | 描述 |
||------|------|------|
|| name | string | 分支名称 |
|| isCurrent | boolean | 是否是当前分支 |

#### 提交数据字段

|| 字段 | 类型 | 描述 |
||------|------|------|
|| commit | Object | 提交哈希信息，包含 long 和 short |
|| author | Object | 作者信息，包含 name、email、date |
|| subject | string | 提交主题 |
|| body | string | 提交详情 |
|| parents | string[] | 父提交哈希数组，用于确定提交关系 |
|| branches | string[] | 包含该提交的所有分支 |
|| primaryBranch | string | 主分支（用于显示） |
|| isMerge | boolean | 是否是合并提交 |
|| lane | number | 轨道位置（用于绘制分支图） |

### 特性

- 📊 三栏布局：分支列表 + 提交历史 + 提交详情
- 🖱️ 可拖拽面板：使用 antd Splitter 实现面板大小调整
- 🌳 使用 @gitgraph/react 绘制 Git Graph
- 🔍 支持提交筛选功能
- 🎨 美观的 UI 设计，类似 GitHub 界面
- 🌍 支持国际化（中文/英文）

### 国际化

组件内置国际化支持，目前支持：

- `zh-CN` - 简体中文（默认）
- `en-US` - 英文

### 依赖

- React 18.2.0+
- antd (Splitter 组件)
- @gitgraph/react
- dayjs (时间处理)
- @kne/react-intl (国际化)
