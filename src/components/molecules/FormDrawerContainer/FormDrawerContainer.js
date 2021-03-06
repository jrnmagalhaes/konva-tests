/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Stage } from 'react-konva';
import { HEADER_SIZE, SIDEBAR_WIDTH } from "../../../utils/constants";

const FormDrawerContainer = ({children, onDrop, onItemDrag, contentHeight}) => {
  const stageRef = React.useRef(null);
  const [height, setHeight] = React.useState(window.innerHeight - HEADER_SIZE);

  React.useEffect(() => {
    if ((height - contentHeight) < 100) {
      setHeight(height + 500);
    }
  }, [contentHeight])

  const onDropEvent = (e) => {
    stageRef.current.setPointersPositions(e);
    const shape = stageRef.current.getIntersection(stageRef.current.getRelativePointerPosition())
    onDrop(shape);
  }

  //TODO: adiciona um debauncer nesse evento
  const onDragOver = (e) => {
    e.preventDefault();
    stageRef.current.setPointersPositions(e);
    const shape = stageRef.current.getIntersection(stageRef.current.getRelativePointerPosition())
    onItemDrag(shape);
  }

  return (
    <div onDragOver={onDragOver} onDrop={onDropEvent} style={{width: window.innerWidth - SIDEBAR_WIDTH, height: window.innerHeight - HEADER_SIZE, overflow: 'auto', overflowX: 'hidden'}}>
      <Stage ref={ref => (stageRef.current = ref)} width={window.innerWidth - SIDEBAR_WIDTH} height={height}>
        {children}
      </Stage>
    </div>
  );
};

export { FormDrawerContainer };
