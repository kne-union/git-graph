import { RegularGraphRows } from './regular';
import { CompactGraphRows } from './compact';
import { Mode } from '../mode';

/**
 * Create graph rows based on mode
 * @param {Mode} mode Graph mode
 * @param {Array} commits List of commits
 * @returns {RegularGraphRows|CompactGraphRows}
 */
export function createGraphRows(mode, commits) {
  return mode === Mode.Compact ? new CompactGraphRows(commits) : new RegularGraphRows(commits);
}

export { RegularGraphRows, CompactGraphRows };
