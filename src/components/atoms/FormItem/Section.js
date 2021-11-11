import React from "react";
import { Rect, Group } from 'react-konva';
import { HOVER_COLOR, SECTION_PADDING } from "../../../utils/constants";

const Section = React.forwardRef(({id, width, height, x, y, opaciy, onClick, onDragStart, onDragMove, onDragEnd, children, hovered}, ref) => {
  return (
    <Group
      width={width}
      height={height}
      ref={ref}
      x={x}
      y={y}
      draggable
      opacity={opaciy}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    >
      <Rect
        x={0}
        y={0}
        width={width}
        id={id}
        height={height}
        strokeWidth={1}
        stroke={'#B9AFE5'}
        dash={[5,5]}
        cornerRadius={8}
      />
      {hovered &&
        <Rect
          x={SECTION_PADDING}
          y={SECTION_PADDING}
          fill={HOVER_COLOR}
          width={width-(2*SECTION_PADDING)}
          height={height-(2*SECTION_PADDING)}
        />
      }
      {children}
    </Group>
  );
});

export { Section };
