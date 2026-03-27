import React, { useState, useMemo } from 'react';
import { Splitter } from 'antd';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';
import dayjs from 'dayjs';

import { useIntl } from '@kne/react-intl';
import withLocale from './withLocale';
import BranchList from './components/BranchList';
import CommitDetail from './components/CommitDetail';
import styles from './style.module.scss';

// 根据字符串生成稳定的颜色
const stringToColor = str => {
  if (!str) return '#999';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12', '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b', '#8e44ad', '#27ae60'];
  return colors[Math.abs(hash) % colors.length];
};

const compactTemplate = templateExtend(TemplateName.Metro, {
  branch: {
    lineWidth: 2,
    spacing: 26,
    label: {
      display: false // 关闭默认的分支标签显示
    }
  },
  commit: {
    spacing: 30,
    dot: {
      size: 5,
      strokeWidth: 2
    },
    message: {
      displayAuthor: true,
      displayHash: true,
      font: 'normal 9pt Calibri'
    }
  }
});

const GitGraphManagerInner = ({ data, onCommitSelect, onBranchSelect }) => {
  const { formatMessage } = useIntl();
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [filterText, setFilterText] = useState('');

  const { branches = [], commits = [] } = data || {};

  const localBranches = useMemo(() => {
    return branches.filter(branch => !branch.name.startsWith('remotes/'));
  }, [branches]);

  const remoteBranches = useMemo(() => {
    return branches.filter(branch => branch.name.startsWith('remotes/'));
  }, [branches]);

  const filteredCommits = useMemo(() => {
    if (!filterText) return commits;
    const lowerFilter = filterText.toLowerCase();
    return commits.filter(commit => commit.subject?.toLowerCase().includes(lowerFilter) || commit.author?.name?.toLowerCase().includes(lowerFilter));
  }, [commits, filterText]);

  const handleCommitClick = commit => {
    setSelectedCommit(commit);
    onCommitSelect?.(commit);
  };

  const handleBranchClick = branch => {
    setSelectedBranch(branch);
    onBranchSelect?.(branch);
  };

  const renderGitgraph = () => {
    return (
      <Gitgraph options={{ template: compactTemplate }}>
        {gitgraph => {
          const branchMap = {};
          const commitMap = {};
          const branchRefs = data.branchRefs || {};

          // 按时间从旧到新排序
          const sortedCommits = [...filteredCommits].reverse();

          // 构建提交索引映射
          sortedCommits.forEach((commit, index) => {
            commitMap[commit.commit.short] = { commit, index };
          });

          // 获取每个提交所属的分支
          const getCommitBranch = commitHash => {
            const info = commitMap[commitHash];
            if (!info) return null;
            return info.commit.primaryBranch;
          };

          // 找到每个分支的起始提交（最早的属于该分支的提交）
          const branchStartCommits = {};
          sortedCommits.forEach(commit => {
            if (!branchStartCommits[commit.primaryBranch]) {
              branchStartCommits[commit.primaryBranch] = commit.commit.short;
            }
          });

          // 从 master 分支开始，递归构建分支图
          const masterBranch = gitgraph.branch('master');
          branchMap['master'] = masterBranch;

          // 遍历所有提交，按正确顺序绘制
          sortedCommits.forEach(commit => {
            const branchName = commit.primaryBranch;
            let branch = branchMap[branchName];
            const parents = commit.parents || [];
            const isMerge = commit.isMerge;

            // 如果分支还未创建
            if (!branch) {
              // 找到分支的分叉点
              const startCommitHash = branchStartCommits[branchName];
              const startCommitInfo = commitMap[startCommitHash];

              if (startCommitInfo && startCommitInfo.commit.parents?.length > 0) {
                // 从父提交所在分支分叉
                const parentBranch = startCommitInfo.commit.parents.map(p => getCommitBranch(p)).find(b => branchMap[b]);

                if (parentBranch && parentBranch !== branchName) {
                  branch = branchMap[parentBranch].branch(branchName);
                } else {
                  branch = masterBranch.branch(branchName);
                }
              } else {
                branch = masterBranch.branch(branchName);
              }
              branchMap[branchName] = branch;
            }

            // 处理合并提交
            if (isMerge && parents.length >= 2) {
              const mainParent = parents[0];
              const mergedParent = parents[1];
              const mergedBranch = getCommitBranch(mergedParent);

              // 如果合并的来源分支存在且不是当前分支
              if (mergedBranch && mergedBranch !== branchName && branchMap[mergedBranch]) {
                try {
                  const timeStr = commit.author?.date ? dayjs(commit.author.date).format('YYYY-MM-DD HH:mm') : '';
                  const authorName = commit.author?.name || '';
                  const authorColor = stringToColor(authorName);
                  const hashShort = commit.commit.short;
                  const messageText = `${commit.subject}${timeStr ? ` (${timeStr})` : ''}`;

                  branch.merge(branchMap[mergedBranch], {
                    hash: commit.commit.short,
                    subject: commit.subject,
                    author: commit.author?.name,
                    renderMessage: renderCommit => {
                      const branchColor = renderCommit.style.dot.color;
                      const dotSize = renderCommit.style.dot.size || 5;

                      const branchWidth = branchName.length * 6 + 16;
                      const hashWidth = hashShort.length * 6;
                      const authorWidth = authorName.length * 6 + 6;

                      return (
                        <g>
                          <rect x="0" y={dotSize - 8} width={branchWidth} height="16" rx="8" fill={branchColor} />
                          <text x="8" y={dotSize} fill="#FFFFFF" style={{ font: 'bold 9pt Calibri' }} alignmentBaseline="middle" dominantBaseline="middle">
                            {branchName}
                          </text>
                          <text x={branchWidth + 8} y={dotSize} fill="#999" style={{ font: 'normal 9pt Consolas, monospace' }} alignmentBaseline="middle" dominantBaseline="middle">
                            {hashShort}
                          </text>
                          <text x={branchWidth + hashWidth + 20} y={dotSize} fill={authorColor} style={{ font: 'bold 9pt Calibri' }} alignmentBaseline="middle" dominantBaseline="middle">
                            {authorName}:
                          </text>
                          <text x={branchWidth + hashWidth + authorWidth + 28} y={dotSize} fill="#666" style={{ font: 'normal 9pt Calibri' }} alignmentBaseline="middle" dominantBaseline="middle">
                            {messageText}
                          </text>
                        </g>
                      );
                    }
                  });
                  return;
                } catch (e) {
                  // 合并失败时回退到普通提交
                }
              }
            }

            // 普通提交
            const timeStr = commit.author?.date ? dayjs(commit.author.date).format('YYYY-MM-DD HH:mm') : '';
            const currentBranchName = commit.primaryBranch;

            branch.commit({
              hash: commit.commit.short,
              subject: commit.subject,
              author: commit.author?.name,
              authorEmail: commit.author?.email,
              renderMessage: renderCommit => {
                const branchColor = renderCommit.style.dot.color;
                const dotSize = renderCommit.style.dot.size || 5;
                const authorName = commit.author?.name || '';
                const authorColor = stringToColor(authorName);
                const hashShort = commit.commit.short;
                const messageText = `${commit.subject}${timeStr ? ` (${timeStr})` : ''}`;

                const branchWidth = currentBranchName.length * 6 + 16;
                const hashWidth = hashShort.length * 6;
                const authorWidth = authorName.length * 6 + 6;

                return (
                  <g>
                    {/* 分支名称标签 */}
                    <rect x="0" y={dotSize - 8} width={branchWidth} height="16" rx="8" fill={branchColor} />
                    <text x="8" y={dotSize} fill="#FFFFFF" style={{ font: 'bold 9pt Calibri' }} alignmentBaseline="middle" dominantBaseline="middle">
                      {currentBranchName}
                    </text>
                    {/* Hash */}
                    <text x={branchWidth + 8} y={dotSize} fill="#999" style={{ font: 'normal 9pt Consolas, monospace' }} alignmentBaseline="middle" dominantBaseline="middle">
                      {hashShort}
                    </text>
                    {/* 作者 */}
                    <text x={branchWidth + hashWidth + 20} y={dotSize} fill={authorColor} style={{ font: 'bold 9pt Calibri' }} alignmentBaseline="middle" dominantBaseline="middle">
                      {authorName}:
                    </text>
                    {/* 提交信息 */}
                    <text x={branchWidth + hashWidth + authorWidth + 28} y={dotSize} fill="#666" style={{ font: 'normal 9pt Calibri' }} alignmentBaseline="middle" dominantBaseline="middle">
                      {messageText}
                    </text>
                  </g>
                );
              }
            });
          });
        }}
      </Gitgraph>
    );
  };

  return (
    <div className={styles.container}>
      <Splitter className={styles.splitter}>
        <Splitter.Panel defaultSize={200} min={150} max={300}>
          <BranchList localBranches={localBranches} remoteBranches={remoteBranches} selectedBranch={selectedBranch} onBranchClick={handleBranchClick} />
        </Splitter.Panel>
        <Splitter.Panel>
          <div className={styles.gitgraphContainer}>{renderGitgraph()}</div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={340} min={280} max={450}>
          <CommitDetail commit={selectedCommit} />
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};

const GitGraphManager = withLocale(GitGraphManagerInner);

export default GitGraphManager;
