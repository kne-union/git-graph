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
