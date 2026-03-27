const gitLogParser = require('git-log-parser');

const getGitData = async () => {
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  // 获取当前目录
  const repoPath = path.resolve(process.cwd(), '../ai-interview-flowup');

  // 检查是否是 git 仓库
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: repoPath });
  } catch (e) {
    console.error('❌ 当前目录不是一个 Git 仓库');
    process.exit(1);
  }

  // 收集数据
  const data = { repo: path.basename(repoPath), timestamp: new Date().toISOString() };

  // 1. 获取分支
  data.branches = execSync('git branch -a', { cwd: repoPath, encoding: 'utf8' })
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const isCurrent = line.startsWith('*');
      const name = line.replace('*', '').trim();
      return { name, isCurrent: isCurrent };
    });

  // 2. 获取提交记录（使用 git-log-parser）
  const rawCommits = await new Promise((resolve, reject) => {
    const results = [];
    const parser = gitLogParser.parse({}, { cwd: repoPath });

    parser.on('data', (commit) => {
      results.push(commit);
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      resolve(results);
    });
  });

  // 3. 为每个提交添加父提交信息和分支信息
  console.log('🔍 正在获取每个提交的父提交和分支信息...');
  const localBranches = data.branches
    .filter(b => !b.name.startsWith('remotes/'))
    .map(b => b.name);

  data.commits = rawCommits.map(commit => {
    try {
      // git-log-parser 可能已经返回 parents 字段，格式为 [{hash: 'xxx'}]
      // 或者我们需要自己获取
      let parents = commit.parents || [];

      // 如果 parents 为空或格式不对，尝试从 git 命令获取
      if (!parents || parents.length === 0 || typeof parents[0] === 'object') {
        const parentsOutput = execSync(
          `git rev-list --parents -n 1 ${commit.commit.long}`,
          { cwd: repoPath, encoding: 'utf8' }
        )
          .trim()
          .split(' ')
          .slice(1); // 第一个是自己，后面是父提交

        parents = parentsOutput.map(hash => hash.substring(0, 7));
      } else if (typeof parents[0] === 'string') {
        // 已经是字符串数组，确保使用短哈希
        parents = parents.map(hash => hash.substring(0, 7));
      }

      // 获取包含该提交的所有分支
      const branches = execSync(
        `git branch --contains ${commit.commit.short}`,
        { cwd: repoPath, encoding: 'utf8' }
      )
        .split('\n')
        .map(line => line.replace('*', '').trim())
        .filter(line => line && !line.startsWith('remotes/'));

      // 找到第一个匹配的本地分支作为主分支
      const primaryBranch = branches.find(b => localBranches.includes(b)) || branches[0] || 'master';

      // 判断是否是合并提交（有多个父提交）
      const isMerge = parents.length > 1;

      return {
        ...commit,
        parents,
        branches,
        primaryBranch,
        isMerge
      };
    } catch (e) {
      return {
        ...commit,
        parents: [],
        branches: ['master'],
        primaryBranch: 'master',
        isMerge: false
      };
    }
  });

  // 4. 构建提交索引映射（用于快速查找）
  const commitIndexMap = new Map();
  data.commits.forEach((commit, index) => {
    commitIndexMap.set(commit.commit.short, index);
  });

  // 5. 计算每个提交的"轨道"位置（用于绘制分支图）
  console.log('🔍 正在计算分支轨道...');
  const lanes = calculateLanes(data.commits, commitIndexMap);
  data.commits = data.commits.map((commit, index) => ({
    ...commit,
    lane: lanes[index]
  }));

  // 6. 构建分支引用信息（每个分支指向的最新提交）
  data.branchRefs = {};
  data.branches.forEach(branch => {
    if (!branch.name.startsWith('remotes/')) {
      try {
        const headCommit = execSync(
          `git rev-parse --short ${branch.name}`,
          { cwd: repoPath, encoding: 'utf8' }
        ).trim();
        data.branchRefs[branch.name] = headCommit;
      } catch (e) {
        // 分支可能已被删除或不存在
      }
    }
  });

  // 输出 JSON
  const outputFile = 'git-data.json';
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`✅ Git 数据已保存到 ${outputFile}`);
  console.log(`📊 统计: ${data.branches.length} 个分支, ${data.commits.length} 条提交`);
};

/**
 * 计算每个提交应该在哪条"轨道"上绘制
 * 核心算法：使用"轨道分配"策略，确保分支线不会交叉
 */
function calculateLanes(commits, commitIndexMap) {
  const lanes = new Array(commits.length).fill(0);
  const occupiedLanes = new Map(); // 记录每个提交占用的轨道

  // 从最新的提交开始处理（数组顺序是从新到旧）
  commits.forEach((commit, index) => {
    const parents = commit.parents || [];
    
    // 找到当前可用的最小轨道
    let myLane = 0;
    
    // 检查是否有父提交在同一轨道上
    for (const parentHash of parents) {
      const parentIndex = commitIndexMap.get(parentHash);
      if (parentIndex !== undefined && parentIndex > index) {
        // 父提交在后面（更早的提交），继承其轨道
        const parentLane = lanes[parentIndex];
        if (occupiedLanes.get(parentIndex) === parentLane) {
          myLane = parentLane;
          break;
        }
      }
    }
    
    // 如果没有继承到轨道，找一个新的
    if (myLane === 0) {
      // 查找当前行已占用的轨道
      const usedLanes = new Set();
      for (let i = index + 1; i < commits.length; i++) {
        // 检查在当前提交之后的提交是否占用了轨道
        const distance = i - index;
        if (distance <= 5) { // 只检查附近的提交
          usedLanes.add(lanes[i]);
        }
      }
      
      // 找到最小的未使用轨道
      while (usedLanes.has(myLane)) {
        myLane++;
      }
    }
    
    lanes[index] = myLane;
    occupiedLanes.set(index, myLane);
  });

  // 第二遍：优化合并提交的轨道
  commits.forEach((commit, index) => {
    if (commit.isMerge && commit.parents.length >= 2) {
      // 对于合并提交，确保两个父提交在不同的轨道上
      const parent1Index = commitIndexMap.get(commit.parents[0]);
      const parent2Index = commitIndexMap.get(commit.parents[1]);
      
      if (parent1Index !== undefined && parent2Index !== undefined) {
        // 合并提交使用主父提交的轨道
        lanes[index] = lanes[parent1Index];
      }
    }
  });

  return lanes;
}

getGitData().catch(console.error);
