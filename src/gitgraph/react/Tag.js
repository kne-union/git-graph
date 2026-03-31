import React from 'react';

export const TAG_PADDING_X = 10;
export const TAG_PADDING_Y = 5;

function DefaultTag(props) {
  const [state, setState] = React.useState({ textWidth: 0, textHeight: 0 });
  const $text = React.useRef(null);

  React.useEffect(() => {
    const box = $text.current.getBBox();
    setState({ textWidth: box.width, textHeight: box.height });
  }, []);

  const tag = props.tag;
  const offset = tag.style.pointerWidth;
  const radius = tag.style.borderRadius;
  const boxWidth = offset + state.textWidth + 2 * TAG_PADDING_X;
  const boxHeight = state.textHeight + 2 * TAG_PADDING_Y;

  const path = [
    'M 0,0',
    `L ${offset},${boxHeight / 2}`,
    `V ${boxHeight / 2}`,
    `Q ${offset},${boxHeight / 2} ${offset + radius},${boxHeight / 2}`,
    `H ${boxWidth - radius}`,
    `Q ${boxWidth},${boxHeight / 2} ${boxWidth},${boxHeight / 2 - radius}`,
    `V -${boxHeight / 2 - radius}`,
    `Q ${boxWidth},-${boxHeight / 2} ${boxWidth - radius},-${boxHeight / 2}`,
    `H ${offset + radius}`,
    `Q ${offset},-${boxHeight / 2} ${offset},-${boxHeight / 2}`,
    `V -${boxHeight / 2}`,
    'z'
  ].join(' ');

  return (
    <g>
      <path d={path} fill={tag.style.bgColor} stroke={tag.style.strokeColor} />
      <text ref={$text} fill={tag.style.color} style={{ font: tag.style.font }} alignmentBaseline="middle" dominantBaseline="middle" x={offset + TAG_PADDING_X} y={0}>
        {tag.name}
      </text>
    </g>
  );
}

export const Tag = React.forwardRef((props, ref) => {
  const { tag, commit, tagX } = props;

  return (
    <g ref={ref} transform={`translate(${tagX || 0}, ${commit.style.dot.size})`}>
      {tag.render ? tag.render(tag.name, tag.style) : React.createElement(DefaultTag, { tag })}
    </g>
  );
});
