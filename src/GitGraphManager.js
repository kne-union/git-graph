import React, { useState, useMemo } from 'react';
import { Splitter } from 'antd';
import { Gitgraph, templateExtend, TemplateName } from './gitgraph';
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
      display: true, // 启用消息显示以便 renderMessage 生效
      displayAuthor: true, // 禁用默认作者格式
      displayHash: true, // 禁用默认哈希格式
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

  // 从提交记录中提取所有分支（包括已合并删除的分支）
  const allBranchesFromCommits = useMemo(() => {
    const branchSet = new Set();
    commits.forEach(commit => {
      if (commit.primaryBranch) {
        branchSet.add(commit.primaryBranch);
      }
      if (commit.branches && Array.isArray(commit.branches)) {
        commit.branches.forEach(b => branchSet.add(b));
      }
    });
    return Array.from(branchSet);
  }, [commits]);

  // 合并现有分支和从提交中提取的分支
  const allBranches = useMemo(() => {
    const branchMap = new Map();

    // 先添加现有分支（保留 isCurrent 信息）
    branches.forEach(branch => {
      if (!branch.name.startsWith('remotes/')) {
        branchMap.set(branch.name, branch);
      }
    });

    // 添加从提交中发现的分支（如果不存在）
    allBranchesFromCommits.forEach(branchName => {
      if (!branchMap.has(branchName) && !branchName.startsWith('remotes/')) {
        branchMap.set(branchName, {
          name: branchName,
          isCurrent: false,
          isMerged: true // 标记为已合并的分支
        });
      }
    });

    return Array.from(branchMap.values());
  }, [branches, allBranchesFromCommits]);

  const localBranches = useMemo(() => {
    return allBranches.filter(branch => !branch.name.startsWith('remotes/'));
  }, [allBranches]);

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

          // 从合并提交的 subject 中提取被合并的分支名
          const extractMergedBranch = commit => {
            if (!commit.isMerge) return null;

            const subject = commit.subject || '';

            // 匹配 "Merge pull request #xxx from leapin-ai/branch-name"
            let match = subject.match(/from\s+[\w-]+\/([\w-]+)/);
            if (match) return match[1];

            // 匹配 "Merge branch 'branch-name'"
            match = subject.match(/Merge branch ['"]([^'"]+)['"]/);
            if (match) {
              const branchName = match[1];
              // 排除远程合并（如 "Merge branch 'linzp' of https://..."）
              if (!subject.includes(' of ') || subject.includes('into')) {
                return branchName;
              }
            }

            return null;
          };

          // 分析每个提交真正属于哪个分支
          const commitBranchMap = {};

          // 方法1：从分支 HEAD 开始回溯
          allBranches.forEach(branchInfo => {
            const branchName = branchInfo.name;
            const headHash = branchRefs[branchName];
            if (!headHash) return;

            let currentHash = headHash;
            const visited = new Set();

            while (currentHash && commitMap[currentHash] && !visited.has(currentHash)) {
              visited.add(currentHash);
              const commitInfo = commitMap[currentHash];

              // 只标记还没有被标记的提交
              if (!commitBranchMap[currentHash]) {
                commitBranchMap[currentHash] = branchName;
              }

              // 沿着第一父提交回溯
              const parents = commitInfo.commit.parents || [];
              currentHash = parents[0];
            }
          });

          // 方法2：从合并提交推断被合并分支的提交
          sortedCommits.forEach(commit => {
            if (commit.isMerge && commit.parents.length >= 2) {
              const mergedBranchName = extractMergedBranch(commit);
              if (mergedBranchName) {
                // 从第二个父提交开始，标记为被合并的分支
                const secondParentHash = commit.parents[1];
                let currentHash = secondParentHash;
                const visited = new Set();

                while (currentHash && commitMap[currentHash] && !visited.has(currentHash)) {
                  visited.add(currentHash);
                  const commitInfo = commitMap[currentHash];

                  // 如果这个提交还没有被标记，或者被标记为错误的分支
                  if (!commitBranchMap[currentHash] || commitBranchMap[currentHash] === commit.primaryBranch) {
                    commitBranchMap[currentHash] = mergedBranchName;
                  }

                  // 继续回溯第一父提交
                  const parents = commitInfo.commit.parents || [];
                  currentHash = parents[0];

                  // 如果遇到已经被正确标记的提交，停止
                  if (currentHash && commitBranchMap[currentHash] === mergedBranchName) {
                    break;
                  }
                }
              }
            }
          });

          // 从 master 分支开始
          const masterBranch = gitgraph.branch('master');
          branchMap['master'] = masterBranch;

          // 遍历所有提交，按正确顺序绘制
          sortedCommits.forEach(commit => {
            console.log('Processing commit:', commit.commit.short, commit.subject);

            // 验证提交数据结构
            if (!commit.commit || !commit.commit.short) {
              console.error('Invalid commit structure:', commit);
              return;
            }

            // 使用分析出的分支，如果没有则使用原始的 primaryBranch
            const branchName = commitBranchMap[commit.commit.short] || commit.primaryBranch;
            let branch = branchMap[branchName];
            const parents = commit.parents || [];
            const isMerge = commit.isMerge;

            console.log('  -> branchName:', branchName, 'branch exists:', !!branch, 'isMerge:', isMerge);

            // 如果分支还未创建
            if (!branch) {
              // 找到该分支第一个提交的父提交所在的分支
              const firstCommitOfBranch = sortedCommits.find(c => (commitBranchMap[c.commit.short] || c.primaryBranch) === branchName);

              if (firstCommitOfBranch && firstCommitOfBranch.parents?.length > 0) {
                const parentHash = firstCommitOfBranch.parents[0];
                const parentBranchName = commitBranchMap[parentHash] || commitMap[parentHash]?.commit.primaryBranch;

                if (parentBranchName && branchMap[parentBranchName] && parentBranchName !== branchName) {
                  branch = branchMap[parentBranchName].branch(branchName);
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
              console.log('  -> Attempting merge for:', commit.commit.short);

              // 优先从 subject 提取被合并的分支名
              let mergedBranchName = extractMergedBranch(commit);

              // 如果提取失败，使用第二个父提交的分支
              if (!mergedBranchName) {
                const mergedParentHash = parents[1];
                mergedBranchName = commitBranchMap[mergedParentHash] || commitMap[mergedParentHash]?.commit.primaryBranch;
              }

              console.log('  -> mergedBranchName:', mergedBranchName, 'exists in branchMap:', !!branchMap[mergedBranchName]);

              // 如果被合并的分支存在且不是当前分支
              if (mergedBranchName && mergedBranchName !== branchName && branchMap[mergedBranchName]) {
                try {
                  console.log('  -> Calling branch.merge()');

                  // 格式化 author 为 "Name <email>" 格式
                  const authorStr = commit.author?.name && commit.author?.email ? `${commit.author.name} <${commit.author.email}>` : commit.author?.name || 'Unknown';

                  // 确保 subject 是字符串
                  const subjectStr = String(commit.subject || '');

                  const timeStr = commit.author?.date ? dayjs(commit.author.date).format('YYYY-MM-DD HH:mm') : '';

                  const mergeCommitOptions = {
                    hash: commit.commit.short,
                    subject: subjectStr,
                    author: authorStr,
                    renderMessage: renderCommit => {
                      console.log('renderMessage called for merge:', commit.commit.short);
                      try {
                        const authorName = commit.author?.name || '';
                        const authorColor = stringToColor(authorName);
                        const hashShort = commit.commit.short;
                        const messageText = `${commit.subject}${timeStr ? ` (${timeStr})` : ''}`;
                        const branchColor = renderCommit.style.dot.color;
                        const dotSize = renderCommit.style.dot.size || 5;

                        const branchWidth = branchName.length * 6 + 16;
                        const hashWidth = hashShort.length * 6;
                        const authorWidth = authorName.length * 6 + 6;

                        return (
                          <g>
                            <rect x="0" y={dotSize - 8} width={branchWidth} height="16" rx="8" fill={branchColor} />
                            <text x="8" y={dotSize} fill="#FFFFFF" fontSize="9pt" fontFamily="Calibri" fontWeight="bold" alignmentBaseline="middle" dominantBaseline="middle">
                              {branchName}
                            </text>
                            <text x={branchWidth + 8} y={dotSize} fill="#999" fontSize="9pt" fontFamily="Consolas, monospace" alignmentBaseline="middle" dominantBaseline="middle">
                              {hashShort}
                            </text>
                            <text x={branchWidth + hashWidth + 20} y={dotSize} fill={authorColor} fontSize="9pt" fontFamily="Calibri" fontWeight="bold" alignmentBaseline="middle" dominantBaseline="middle">
                              {authorName}:
                            </text>
                            <text x={branchWidth + hashWidth + authorWidth + 28} y={dotSize} fill="#666" fontSize="9pt" fontFamily="Calibri" alignmentBaseline="middle" dominantBaseline="middle">
                              {messageText}
                            </text>
                          </g>
                        );
                      } catch (error) {
                        console.error('Error rendering merge commit:', error, commit);
                        return (
                          <g>
                            <text x="0" y="0" fill="#666" style={{ font: 'normal 9pt Calibri' }}>
                              {commit.subject || 'Error rendering commit'}
                            </text>
                          </g>
                        );
                      }
                    }
                  };

                  console.log('Merge commitOptions:', {
                    hash: mergeCommitOptions.hash,
                    subject: mergeCommitOptions.subject,
                    hasRenderMessage: typeof mergeCommitOptions.renderMessage === 'function'
                  });

                  console.log('[DEBUG] Full mergeCommitOptions object:', mergeCommitOptions);
                  console.log('[DEBUG] mergeCommitOptions keys:', Object.keys(mergeCommitOptions));

                  const mergeOptions = {
                    branch: branchMap[mergedBranchName],
                    commitOptions: mergeCommitOptions
                  };

                  console.log('[DEBUG] Full mergeOptions object:', mergeOptions);
                  console.log('[DEBUG] mergeOptions.commitOptions:', mergeOptions.commitOptions);
                  console.log('[DEBUG] mergeOptions.commitOptions keys:', Object.keys(mergeOptions.commitOptions));

                  branch.merge(mergeOptions);
                  console.log('  -> branch.merge() completed successfully');
                  return;
                } catch (e) {
                  console.warn('合并失败，回退到普通提交:', e);
                }
              } else {
                console.log('  -> Merge conditions not met, falling back to normal commit');
              }
            }

            // 非 merge 提交或 merge 失败时，使用普通 commit
            const timeStr = commit.author?.date ? dayjs(commit.author.date).format('YYYY-MM-DD HH:mm') : '';

            // 格式化 author 为 "Name <email>" 格式
            const authorStr = commit.author?.name && commit.author?.email ? `${commit.author.name} <${commit.author.email}>` : commit.author?.name || 'Unknown';

            // 确保 subject 是字符串
            const subjectStr = String(commit.subject || '');

            branch.commit({
              hash: commit.commit.short,
              subject: subjectStr,
              author: authorStr,
              renderMessage: renderCommit => {
                console.log('renderMessage called for commit:', commit.commit.short);
                try {
                  const branchColor = renderCommit.style.dot.color;
                  const dotSize = renderCommit.style.dot.size || 5;
                  const authorName = commit.author?.name || '';
                  const authorColor = stringToColor(authorName);
                  const hashShort = commit.commit.short;
                  const messageText = `${commit.subject}${timeStr ? ` (${timeStr})` : ''}`;

                  const branchWidth = branchName.length * 6 + 16;
                  const hashWidth = hashShort.length * 6;
                  const authorWidth = authorName.length * 6 + 6;

                  return (
                    <g>
                      {/* 分支名称标签 */}
                      <rect x="0" y={dotSize - 8} width={branchWidth} height="16" rx="8" fill={branchColor} />
                      <text x="8" y={dotSize} fill="#FFFFFF" fontSize="9pt" fontFamily="Calibri" fontWeight="bold" alignmentBaseline="middle" dominantBaseline="middle">
                        {branchName}
                      </text>
                      {/* Hash */}
                      <text x={branchWidth + 8} y={dotSize} fill="#999" fontSize="9pt" fontFamily="Consolas, monospace" alignmentBaseline="middle" dominantBaseline="middle">
                        {hashShort}
                      </text>
                      {/* 作者 */}
                      <text x={branchWidth + hashWidth + 20} y={dotSize} fill={authorColor} fontSize="9pt" fontFamily="Calibri" fontWeight="bold" alignmentBaseline="middle" dominantBaseline="middle">
                        {authorName}:
                      </text>
                      {/* 提交信息 */}
                      <text x={branchWidth + hashWidth + authorWidth + 28} y={dotSize} fill="#666" fontSize="9pt" fontFamily="Calibri" alignmentBaseline="middle" dominantBaseline="middle">
                        {messageText}
                      </text>
                    </g>
                  );
                } catch (error) {
                  console.error('Error rendering commit:', error, commit);
                  // 返回一个简单的文本作为回退
                  return (
                    <g>
                      <text x="0" y="0" fill="#666" style={{ font: 'normal 9pt Calibri' }}>
                        {commit.subject || 'Error rendering commit'}
                      </text>
                    </g>
                  );
                }
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
