/**
 * Branches order calculator
 */
export class BranchesOrder {
  constructor(commits, colors, compareFunction) {
    this.branches = new Set();
    this.colors = colors;
    commits.forEach(commit => this.branches.add(commit.branchToDisplay));
    if (compareFunction) {
      this.branches = new Set(Array.from(this.branches).sort(compareFunction));
    }
  }

  /**
   * Return the order of the given branch name.
   * @param {string} branchName Name of the branch
   * @returns {number}
   */
  get(branchName) {
    return Array.from(this.branches).findIndex(branch => branch === branchName);
  }

  /**
   * Return the color of the given branch.
   * @param {string} branchName Name of the branch
   * @returns {string}
   */
  getColorOf(branchName) {
    return this.colors[this.get(branchName) % this.colors.length];
  }
}
