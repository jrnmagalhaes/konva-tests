import React from "react";
import { Circle, Group } from 'react-konva';
import { exitPointPosition, initialPointPosition } from "../../../utils/calculatePositions";
import {MAIN_RADIUS, LINK_RADIUS, LINK_DISTANCE} from '../../../utils/constants';

const FlowItem = ({id, x, y, color, initial, selected, state, exitLinked, initialLinked, isDragging, onDragStart, onDragEnd, onDragMove, onClick}) => {
  const onDrag = (e) => {
    onDragMove(e.target.attrs, initial);
  }
  const onClickMain = (e) => {
    onClick(id);
  }
  return (
    <Group
      id={id}
      x={initial ? x-MAIN_RADIUS : x-(MAIN_RADIUS+LINK_DISTANCE+(LINK_RADIUS*2))}
      y={y-MAIN_RADIUS}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragMove={onDrag}
    >
      {!initial &&
        <Circle
          id={`initial-${id}`}
          {...initialPointPosition(x, y, MAIN_RADIUS, true)}
          radius={LINK_RADIUS}
          fill={initialLinked ? '#2F80ED' : '#EB5757'}
        />
      }
      <Circle
        id={`main-${id}`}
        x={!initial ? ((2*LINK_RADIUS)+LINK_DISTANCE+MAIN_RADIUS) : MAIN_RADIUS}
        y={MAIN_RADIUS}
        radius={MAIN_RADIUS}
        fill={color}
        onClick={onClickMain}
        strokeWidth={selected?'2px':undefined}
        stroke={selected?"#0220CC":undefined}
      />
      <Circle
        id={`exit-${id}`}
        {...exitPointPosition(x, y, MAIN_RADIUS, LINK_RADIUS, LINK_DISTANCE, initial, true)}
        x={!initial ? ((3*LINK_RADIUS)+(2*LINK_DISTANCE)+(2*MAIN_RADIUS)) : (LINK_RADIUS+LINK_DISTANCE+(2*MAIN_RADIUS))}
        y={MAIN_RADIUS}
        radius={LINK_RADIUS}
        fill={exitLinked ? '#2F80ED' : '#EB5757'}
      />
    </Group>
  );
};

export { FlowItem };
