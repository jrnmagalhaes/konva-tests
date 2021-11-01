import React from "react";
import { Rect, Group } from 'react-konva';
import { DISTANCE_BETWEEN_ELEMENTS } from "../../../utils/constants";

const FormColumn = ({id, index, x, y, width, height, children}) => {
  return (
    <Group
      x={x}
      y={y}
      width={width}
      height={height + DISTANCE_BETWEEN_ELEMENTS}
    >
      <Rect
        x={0}
        y={0}
        id={`${index}-${id}-column`}
        width={width}
        height={height + DISTANCE_BETWEEN_ELEMENTS}
      />
      {children}
    </Group>
  );
};

export { FormColumn };