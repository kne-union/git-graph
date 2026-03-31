# Gitgraph 重新实现说明

## 概述

本目录包含了从 `@gitgraph/core` 和 `@gitgraph/react` 重新实现的 Git 图表库。

## 目录结构

```
src/gitgraph/
├── core/                  # 核心库 (平台无关)
│   ├── branch.js         # Branch 类
│   ├── commit.js         # Commit 类
│   ├── gitgraph.js       # GitgraphCore 核心控制器
│   ├── refs.js           # 引用管理
│   ├── tag.js            # Tag 类
│   ├── template.js       # 样式模板
│   ├── mode.js           # 显示模式枚举
│   ├── orientation.js    # 图表方向枚举
│   ├── branches-order.js # 分支排序
│   ├── branches-paths.js # 分支路径计算
│   ├── utils.js          # 工具函数
│   ├── graph-rows/       # 图表行计算
│   │   ├── regular.js    # 常规模式
│   │   ├── compact.js    # 紧凑模式
│   │   └── index.js      # 入口
│   ├── user-api/         # 用户 API 层
│   │   ├── gitgraph-user-api.js
│   │   └── branch-user-api.js
│   └── index.js          # 核心库导出
│
├── react/                # React 渲染器
│   ├── Gitgraph.js       # 主组件
│   ├── Commit.js         # 提交组件
│   ├── Dot.js            # 提交点组件
│   ├── Arrow.js          # 箭头组件
│   ├── BranchLabel.js    # 分支标签组件
│   ├── BranchPath.js     # 分支路径组件
│   ├── Tag.js            # 标签组件
│   ├── Message.js        # 消息组件
│   ├── Tooltip.js        # 提示框组件
│   └── index.js          # React 组件导出
│
└── index.js              # 主入口

```

## 使用方式

### 基本使用

```jsx
import { Gitgraph, templateExtend, TemplateName } from './gitgraph';

function MyComponent() {
  return (
    <Gitgraph options={{ template: TemplateName.Metro }}>
      {gitgraph => {
        // 创建主分支提交
        gitgraph.commit('Initial commit');

        // 创建并切换到新分支
        const develop = gitgraph.branch('develop');
        develop.commit('Add feature');

        // 合并回主分支
        const master = gitgraph.branch('master');
        master.merge(develop, 'Merge develop');
      }}
    </Gitgraph>
  );
}
```

### 自定义样式

```jsx
import { Gitgraph, templateExtend, TemplateName, MergeStyle } from './gitgraph';

const myTemplate = templateExtend(TemplateName.Metro, {
  colors: ['#FF5733', '#33FF57', '#3357FF'],
  branch: {
    lineWidth: 3,
    mergeStyle: MergeStyle.Bezier
  },
  commit: {
    dot: { size: 8 },
    message: { font: 'normal 12px Arial' }
  }
});
```

## 主要特性

1. **纯 JavaScript 实现** - 将 TypeScript 源码转换为纯 ES6 JavaScript
2. **接口完全兼容** - 保持与原库相同的 API 接口
3. **功能完整** - 支持所有核心功能:
   - 分支创建、删除
   - 提交渲染
   - 合并操作
   - 标签管理
   - 自定义模板
   - 自定义渲染函数

## 关键改进

### 1. renderMessage 支持增强

在 `branch-user-api.js` 中特别处理了 render 函数的传递:

```javascript
// 提取渲染函数 BEFORE any spreading
const renderFunctions = {
  renderMessage: commitOptions.renderMessage,
  renderDot: commitOptions.renderDot,
  renderTooltip: commitOptions.renderTooltip
};

// 强制设置渲染函数，确保它们不会丢失
Object.keys(renderFunctions).forEach(key => {
  if (renderFunctions[key] !== undefined) {
    commitArgs[key] = renderFunctions[key];
  }
});
```

这确保了在合并提交时，自定义的 `renderMessage` 函数能够正确传递。

### 2. 移除了 TypeScript 特定语法

将所有 TypeScript 代码转换为纯 JavaScript:

- 移除了类型注解
- 移除了接口定义
- 将枚举转换为对象常量
- 移除了 TypeScript 编译器生成的辅助代码

### 3. 简化导入路径

所有模块使用相对路径导入，不再依赖 `@gitgraph/core` 包。

## 原始库信息

- 原始包: `@gitgraph/react` v1.6.0
- 原始包: `@gitgraph/core` v1.5.0
- 许可证: MIT
- 仓库: https://github.com/nicoespeon/gitgraph.js

## 迁移说明

从 `@gitgraph/react` 迁移到新实现:

**之前:**

```jsx
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';
```

**之后:**

```jsx
import { Gitgraph, templateExtend, TemplateName } from './gitgraph';
```

其他代码无需修改，接口完全兼容。
