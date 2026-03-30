// Script to transform mockData2.js from GitHub API format to the expected format
const fs = require('fs');
const path = require('path');

// Read the raw GitHub API data
const rawDataPath = path.join(__dirname, 'mockData2.js');
const rawContent = fs.readFileSync(rawDataPath, 'utf-8');

// Extract the data array from the file
const dataMatch = rawContent.match(/const data = (\[[\s\S]*\]);/);
if (!dataMatch) {
  console.error('Could not find data array in mockData2.js');
  process.exit(1);
}

const rawData = JSON.parse(dataMatch[1]);

console.log(`Found ${rawData.length} commits in raw data`);

// Extract unique branches from commits
const branchSet = new Set();
const branchCommits = new Map();

// First pass: collect all branches
rawData.forEach(commit => {
  // GitHub API doesn't provide branch info directly, so we'll infer from merge commits
  // For now, we'll use a default branch approach
  branchSet.add('master'); // Default branch
});

// Get default branch (most recent commit's branch)
const defaultBranch = 'master';

// Transform branches
const branches = Array.from(branchSet).map(name => ({
  name,
  isCurrent: name === defaultBranch
}));

// Transform commits
const commits = rawData.map((commit) => {
  const message = commit.commit.message;
  const lines = message.split('\n');
  const subject = lines[0];
  const body = lines.slice(1).join('\n').trim();
  
  return {
    commit: {
      long: commit.sha,
      short: commit.sha.substring(0, 7)
    },
    author: {
      name: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date
    },
    committer: {
      name: commit.commit.committer.name,
      email: commit.commit.committer.email,
      date: commit.commit.committer.date
    },
    subject: subject,
    body: body,
    parents: commit.parents.map(p => p.sha.substring(0, 7)),
    branches: [defaultBranch],
    primaryBranch: defaultBranch,
    isMerge: commit.parents.length > 1,
    lane: 0
  };
});

// Build branchRefs (branch name -> latest commit hash)
const branchRefs = {
  [defaultBranch]: commits[0].commit.short
};

// Create the final data structure
const transformedData = {
  repo: 'kne-union/components-core',
  timestamp: new Date().toISOString(),
  branches,
  commits,
  branchRefs
};

// Write the transformed data
const outputPath = path.join(__dirname, 'mockData2-transformed.js');
const outputContent = `// Transformed from GitHub API format
const mockData2 = ${JSON.stringify(transformedData, null, 2)};

export default mockData2;
`;

fs.writeFileSync(outputPath, outputContent, 'utf-8');

console.log(`✓ Transformed data written to ${outputPath}`);
console.log(`  - ${branches.length} branches`);
console.log(`  - ${commits.length} commits`);
console.log(`  - ${commits.filter(c => c.isMerge).length} merge commits`);
