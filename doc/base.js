const { default: GitGraphManager } = _GitGraph;
const { Card, Space, Button, message } = antd;
const { useState } = React;
const { default: mockGitData } = _mockData;

const BaseExample = () => {
  const handleCommitSelect = commit => {
    message.info(`选中提交: ${commit.subject}`);
  };

  const handleBranchSelect = branch => {
    message.info(`选中分支: ${branch.name}`);
  };

  return (
    <div style={{ height: '600px' }}>
      <GitGraphManager data={mockGitData} onCommitSelect={handleCommitSelect} onBranchSelect={handleBranchSelect} />
    </div>
  );
};

render(<BaseExample />);
