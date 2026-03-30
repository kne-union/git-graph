import { useState, useEffect } from 'react';
import { Spin, Alert, Input, Button, Space } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

/**
 * 从 GitHub API 获取仓库的分支和提交信息
 * @param {string} repoUrl - GitHub 仓库 URL，例如 "https://github.com/kne-union/components-core"
 * @param {Object} options - 配置选项
 * @param {number} options.maxCommits - 最大获取提交数量，0 表示获取所有（最多 10000）
 * @param {string} options.token - GitHub Personal Access Token（可选，用于提高速率限制）
 * @param {Function} options.onProgress - 进度回调函数，接收 {current, total, message} 参数
 * @returns {Promise<Object>} Git 数据对象
 */
const fetchGitDataFromGitHub = async (repoUrl, options = {}) => {
  const { maxCommits = 0, token, onProgress } = options;

  // 解析仓库 URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error('Invalid GitHub URL format. Expected: https://github.com/owner/repo');
  }

  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');

  const baseUrl = `https://api.github.com/repos/${owner}/${cleanRepo}`;

  // 设置请求头
  const headers = {
    Accept: 'application/vnd.github.v3+json'
  };

  // 如果提供了 token，添加认证头
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  // 报告进度
  const reportProgress = (message, current, total) => {
    if (onProgress) {
      onProgress({ message, current, total });
    }
  };

  // 检查速率限制的辅助函数
  const checkRateLimit = async response => {
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      const rateLimitReset = response.headers.get('X-RateLimit-Reset');

      if (rateLimitRemaining === '0') {
        const resetDate = new Date(parseInt(rateLimitReset) * 1000);
        throw new Error(
          `GitHub API 速率限制已达上限。` +
            `${token ? '已认证' : '未认证'}请求限制：${token ? '5000' : '60'} 次/小时。` +
            `限制将在 ${resetDate.toLocaleTimeString()} 重置。` +
            `${!token ? '\n\n建议：添加 GitHub Token 以提高速率限制（60 -> 5000 次/小时）' : ''}`
        );
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API 请求失败 (${response.status}): ${response.statusText}\n${errorText}`);
    }
  };

  reportProgress('正在获取仓库信息...', 0, 4);

  // 获取仓库信息
  const repoResponse = await fetch(baseUrl, { headers });
  await checkRateLimit(repoResponse);
  const repoData = await repoResponse.json();
  const defaultBranch = repoData.default_branch;

  reportProgress('正在获取分支列表...', 1, 4);

  // 获取分支列表（分页获取所有分支）
  let allBranches = [];
  let page = 1;
  let hasMoreBranches = true;

  while (hasMoreBranches) {
    const branchesResponse = await fetch(`${baseUrl}/branches?per_page=100&page=${page}`, { headers });
    await checkRateLimit(branchesResponse);
    const branchesData = await branchesResponse.json();

    if (branchesData.length === 0) {
      hasMoreBranches = false;
    } else {
      allBranches = allBranches.concat(branchesData);
      page++;
    }
  }

  reportProgress('正在获取提交历史...', 2, 4);

  // 计算需要获取的页数
  const perPage = 100;
  const targetCommits = maxCommits > 0 ? Math.min(maxCommits, 10000) : 10000;
  const maxPages = Math.ceil(targetCommits / perPage);

  // 获取提交历史（分页获取）
  let allCommits = [];
  page = 1;
  let hasMoreCommits = true;
  let totalFetched = 0;

  while (hasMoreCommits && page <= maxPages) {
    const commitsResponse = await fetch(`${baseUrl}/commits?per_page=${perPage}&page=${page}`, { headers });
    await checkRateLimit(commitsResponse);
    const commitsData = await commitsResponse.json();

    if (commitsData.length === 0) {
      hasMoreCommits = false;
    } else {
      // 如果是最后一页，只取需要的数量
      const remainingNeeded = targetCommits - totalFetched;
      const commitsToAdd = commitsData.slice(0, remainingNeeded);

      allCommits = allCommits.concat(commitsToAdd);
      totalFetched += commitsToAdd.length;

      const progressMsg = maxCommits > 0 ? `已获取 ${totalFetched} / ${targetCommits} 个提交...` : `已获取 ${totalFetched} 个提交...`;
      reportProgress(progressMsg, 2, 4);

      page++;

      // 如果已经获取到目标数量，停止
      if (totalFetched >= targetCommits) {
        hasMoreCommits = false;
      }
    }
  }

  reportProgress('正在处理数据...', 3, 4);

  // 转换分支数据
  const branches = allBranches.map(branch => ({
    name: branch.name,
    isCurrent: branch.name === defaultBranch
  }));

  // 转换提交数据
  const commits = allCommits.map(commit => {
    // 确保从正确的位置提取 author 和 committer 信息
    // GitHub API 返回的数据中，commit.commit.author 是实际的提交作者
    // commit.author 是 GitHub 用户对象（可能为 null）
    const commitAuthor = commit.commit?.author || {};
    const commitCommitter = commit.commit?.committer || {};

    return {
      commit: {
        long: commit.sha,
        short: commit.sha.substring(0, 7)
      },
      author: {
        name: commitAuthor.name || 'Unknown',
        email: commitAuthor.email || '',
        date: commitAuthor.date || ''
      },
      committer: {
        name: commitCommitter.name || 'Unknown',
        email: commitCommitter.email || '',
        date: commitCommitter.date || ''
      },
      subject: commit.commit?.message?.split('\n')[0] || '',
      body: commit.commit?.message?.split('\n').slice(1).join('\n').trim() || '',
      parents: (commit.parents || []).map(p => p.sha.substring(0, 7)),
      branches: [defaultBranch], // GitHub API 不直接提供分支信息，默认使用主分支
      primaryBranch: defaultBranch,
      isMerge: (commit.parents || []).length > 1,
      lane: 0
    };
  });

  // 构建 branchRefs 映射（分支名 -> 提交哈希）
  const branchRefs = {};
  allBranches.forEach(branch => {
    branchRefs[branch.name] = branch.commit.sha.substring(0, 7);
  });

  reportProgress('完成！', 4, 4);

  return {
    repo: `${owner}/${cleanRepo}`,
    timestamp: new Date().toISOString(),
    branches,
    commits,
    branchRefs
  };
};

/**
 * GitDataFetcher 组件
 * 提供输入框让用户输入 GitHub 仓库地址，然后获取并显示 Git 数据
 */
const GitDataFetcher = ({ children, defaultRepo = 'https://github.com/kne-union/components-core', defaultMaxCommits = 0, defaultToken = '' }) => {
  const [repoUrl, setRepoUrl] = useState(defaultRepo);
  const [inputValue, setInputValue] = useState(defaultRepo);
  const [maxCommits, setMaxCommits] = useState(defaultMaxCommits);
  const [maxCommitsInput, setMaxCommitsInput] = useState(defaultMaxCommits);
  const [token, setToken] = useState(defaultToken);
  const [tokenInput, setTokenInput] = useState(defaultToken);
  const [gitData, setGitData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ message: '', current: 0, total: 0 });

  const fetchData = async (url, commits, authToken) => {
    setLoading(true);
    setError(null);
    setProgress({ message: '开始获取数据...', current: 0, total: 4 });

    try {
      const data = await fetchGitDataFromGitHub(url, {
        maxCommits: commits,
        token: authToken,
        onProgress: progressInfo => {
          setProgress(progressInfo);
        }
      });
      setGitData(data);
      setRepoUrl(url);
      setMaxCommits(commits);
      setToken(authToken);
    } catch (err) {
      setError(err.message);
      setGitData(null);
    } finally {
      setLoading(false);
      setProgress({ message: '', current: 0, total: 0 });
    }
  };

  useEffect(() => {
    if (defaultRepo) {
      fetchData(defaultRepo, defaultMaxCommits, defaultToken);
    }
  }, []);

  const handleFetch = () => {
    if (inputValue.trim()) {
      const commits = parseInt(maxCommitsInput) || 0;
      fetchData(inputValue.trim(), commits, tokenInput.trim());
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space.Compact style={{ width: '100%' }}>
            <Input prefix={<GithubOutlined />} placeholder="输入 GitHub 仓库地址，例如: https://github.com/owner/repo" value={inputValue} onChange={e => setInputValue(e.target.value)} onPressEnter={handleFetch} disabled={loading} />
            <Button type="primary" onClick={handleFetch} loading={loading}>
              获取
            </Button>
          </Space.Compact>

          <Space style={{ width: '100%' }} wrap>
            <span style={{ whiteSpace: 'nowrap' }}>获取提交数：</span>
            <Input type="number" placeholder="0 = 全部（最多10000）" value={maxCommitsInput} onChange={e => setMaxCommitsInput(e.target.value)} onPressEnter={handleFetch} disabled={loading} min={0} max={10000} style={{ width: '180px' }} />
            <span style={{ color: '#999', fontSize: '12px' }}>{maxCommitsInput > 0 ? `将获取 ${Math.min(maxCommitsInput, 10000)} 个` : '获取全部（最多10000）'}</span>
          </Space>

          <Space style={{ width: '100%' }} wrap>
            <span style={{ whiteSpace: 'nowrap' }}>GitHub Token：</span>
            <Input.Password placeholder="可选，格式: ghp_xxxx（用于提高速率限制）" value={tokenInput} onChange={e => setTokenInput(e.target.value)} onPressEnter={handleFetch} disabled={loading} style={{ width: '350px' }} />
            <span style={{ color: '#999', fontSize: '12px' }}>
              {tokenInput ? (tokenInput.startsWith('ghp_') || tokenInput.startsWith('github_pat_') ? '✓ Token 格式正确（5000次/小时）' : '⚠️ Token 格式可能不正确') : '未设置（60次/小时）'}
            </span>
          </Space>
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '16px' }}>
            <Spin size="large" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>{progress.message}</div>
              {progress.total > 0 && (
                <div style={{ fontSize: '14px', color: '#666' }}>
                  进度: {progress.current} / {progress.total}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '16px' }}>
            <Alert message="获取失败" description={<div style={{ whiteSpace: 'pre-wrap' }}>{error}</div>} type="error" showIcon />
          </div>
        )}

        {!loading && !error && gitData && (
          <>
            <div style={{ padding: '8px 16px', background: '#f5f5f5', borderBottom: '1px solid #e8e8e8', fontSize: '12px', color: '#666' }}>
              已加载: {gitData.commits.length} 个提交, {gitData.branches.length} 个分支
              {token && <span style={{ marginLeft: '16px', color: '#52c41a' }}>✓ 已使用 Token 认证</span>}
            </div>
            {children(gitData)}
          </>
        )}
      </div>
    </div>
  );
};

export default GitDataFetcher;
export { fetchGitDataFromGitHub };
