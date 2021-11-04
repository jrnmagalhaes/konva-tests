import React from "react";
import { Group } from 'react-konva';
import { DISTANCE_BETWEEN_ELEMENTS } from "../../../utils/constants";

const FormColumn = ({id, index, x, y, width, height, children}) => {
  return (
    <Group
      x={x}
      y={y}
      // id={`${index}-${id}-column`}
      width={width}
      height={height + DISTANCE_BETWEEN_ELEMENTS}
    >
      {children}
    </Group>
  );
};

export { FormColumn };
