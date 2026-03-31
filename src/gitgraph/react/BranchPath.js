import React from 'react';
import { toSvgPath } from '../core';

/**
 * BranchPath component
 */
export class BranchPath extends React.Component {
  render() {
    const path = toSvgPath(
      this.props.coordinates.map(a => a.map(b => this.props.getWithCommitOffset(b))),
      this.props.isBezier,
      this.props.gitgraph.isVertical
    );

    return <path d={path} fill="none" stroke={this.props.branch.computedColor} strokeWidth={this.props.branch.style.lineWidth} transform={`translate(${this.props.offset}, ${this.props.offset})`} />;
  }
}
