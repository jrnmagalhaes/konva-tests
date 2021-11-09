import React from "react";
import { Rect, Group } from 'react-konva';

const Section = React.forwardRef(({id, width, height, x, y, opaciy, onClick, onDragStart, onDragMove, onDragEnd, children}, ref) => {
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
    </Group>
  );
});

export { Section };
