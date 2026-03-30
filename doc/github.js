const { default: GitGraphManager, GitDataFetcher } = _GitGraph;
const { message } = antd;

const GitHubExample = () => {
  const handleCommitSelect = commit => {
    message.info(`选中提交: ${commit.subject}`);
  };

  const handleBranchSelect = branch => {
    message.info(`选中分支: ${branch.name}`);
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
