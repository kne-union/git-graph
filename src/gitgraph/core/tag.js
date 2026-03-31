import { numberOptionOr } from './utils';

/**
 * Tag class
 */
export class Tag {
  constructor(name, style, render, commitStyle) {
    this.name = name;
    this.tagStyle = style;
    this.commitStyle = commitStyle;
    this.render = render;
  }

  /**
   * Get tag style
   */
  get style() {
    return {
      strokeColor: this.tagStyle.strokeColor || this.commitStyle.color,
      bgColor: this.tagStyle.bgColor || this.commitStyle.color,
      color: this.tagStyle.color || 'white',
      font: this.tagStyle.font || this.commitStyle.message?.font || 'normal 12pt Calibri',
      borderRadius: numberOptionOr(this.tagStyle.borderRadius, 10),
      pointerWidth: numberOptionOr(this.tagStyle.pointerWidth, 12)
    };
  }
}
