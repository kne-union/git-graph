/**
 * Refs - Reference manager
 */
export class Refs {
  constructor() {
    this.commitPerName = new Map();
    this.namesPerCommit = new Map();
  }

  /**
   * Set a new reference to a commit hash.
   * @param {string} name Name of the ref (ex: "master", "v1.0")
   * @param {string} commitHash Commit hash
   * @returns {Refs}
   */
  set(name, commitHash) {
    const prevCommitHash = this.commitPerName.get(name);
    if (prevCommitHash) {
      this.removeNameFrom(prevCommitHash, name);
    }
    this.addNameTo(commitHash, name);
    this.addCommitTo(name, commitHash);
    return this;
  }

  /**
   * Delete a reference
   * @param {string} name Name of the reference
   * @returns {Refs}
   */
  delete(name) {
    if (this.hasName(name)) {
      this.removeNameFrom(this.getCommit(name), name);
      this.commitPerName.delete(name);
    }
    return this;
  }

  /**
   * Get the commit hash associated with the given reference name.
   * @param {string} name Name of the ref
   * @returns {string|undefined}
   */
  getCommit(name) {
    return this.commitPerName.get(name);
  }

  /**
   * Get the list of reference names associated with given commit hash.
   * @param {string} commitHash Commit hash
   * @returns {Array<string>}
   */
  getNames(commitHash) {
    return this.namesPerCommit.get(commitHash) || [];
  }

  /**
   * Get all reference names known.
   * @returns {Array<string>}
   */
  getAllNames() {
    return Array.from(this.commitPerName.keys());
  }

  /**
   * Returns true if given commit hash is referenced.
   * @param {string} commitHash Commit hash
   * @returns {boolean}
   */
  hasCommit(commitHash) {
    return this.namesPerCommit.has(commitHash);
  }

  /**
   * Returns true if given reference name exists.
   * @param {string} name Name of the ref
   * @returns {boolean}
   */
  hasName(name) {
    return this.commitPerName.has(name);
  }

  removeNameFrom(commitHash, nameToRemove) {
    const names = this.namesPerCommit.get(commitHash) || [];
    this.namesPerCommit.set(
      commitHash,
      names.filter(name => name !== nameToRemove)
    );
  }

  addNameTo(commitHash, nameToAdd) {
    const prevNames = this.namesPerCommit.get(commitHash) || [];
    this.namesPerCommit.set(commitHash, [...prevNames, nameToAdd]);
  }

  addCommitTo(name, commitHashToAdd) {
    this.commitPerName.set(name, commitHashToAdd);
  }
}
