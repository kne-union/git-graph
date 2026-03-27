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
