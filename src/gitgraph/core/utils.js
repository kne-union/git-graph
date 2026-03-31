/**
 * Utility functions
 */

/**
 * Return default value for boolean option
 * @param {any} value
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
export function booleanOptionOr(value, defaultValue) {
  return typeof value === 'boolean' ? value : defaultValue;
}

/**
 * Return default value for number option
 * @param {any} value
 * @param {number} defaultValue
 * @returns {number}
 */
export function numberOptionOr(value, defaultValue) {
  return typeof value === 'number' ? value : defaultValue;
}

/**
 * Pick properties from object
 * @param {Object} obj
 * @param {Array} paths
 * @returns {Object}
 */
export function pick(obj, paths) {
  return paths.reduce((mem, key) => {
    mem[key] = obj[key];
    return mem;
  }, {});
}

/**
 * Remove undefined keys from object
 * @param {Object} obj
 * @returns {Object}
 */
export function withoutUndefinedKeys(obj) {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  const result = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Generate arrow SVG path
 * @param {Object} graph
 * @param {Object} parent
 * @param {Object} commit
 * @returns {string}
 */
export function arrowSvgPath(graph, parent, commit) {
  const commitRadius = commit.style.dot.size;
  const size = graph.template.arrow.size;
  const h = commitRadius + size;
  const delta = graph.reverseArrow ? -1 : 1;

  // Arrow
  const alpha = Math.atan2(parent.y - commit.y, parent.x - commit.x);
  // Alpha is the angle between parent & current commit round.
  // We need to draw the arrow on the round.
  // We need to compute the point on the round at this angle.
  // We can use polar coordinates: x = r * cos(angle), y = r * sin(angle).
  // Then we can use the `rotate` transform to draw the arrow at the right angle.
  const path = `M ${commit.x + commitRadius} ${commit.y}
    a ${commitRadius} ${commitRadius} 0 0 ${delta > 0 ? 0 : 1}
    ${-commitRadius + h * Math.cos(alpha)} ${h * Math.sin(alpha)}
    l ${size * Math.cos(alpha + Math.PI / 2)} ${size * Math.sin(alpha + Math.PI / 2)}
    L ${commit.x + h * Math.cos(alpha)} ${h * Math.sin(alpha) + commit.y}
    L ${size * Math.cos(alpha - Math.PI / 2)} ${size * Math.sin(alpha - Math.PI / 2)}
    Z`;

  return path;
}
