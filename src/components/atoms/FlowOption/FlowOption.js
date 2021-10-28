import React from "react";
import { MAIN_RADIUS } from "../../../utils/constants";

const FlowOption = ({color, onDragStart}) => {
  const flowOptionRef = React.useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const onDrag = (e) => {
    setIsDragging(true);
    onDragStart();
  }
  const onDrop = (e) => {
    setIsDragging(false);
  }
  return (
    <div
      ref={flowOptionRef}
      draggable
      onDragStart={onDrag}
      onDragEnd={onDrop}
      style={{
        ...styles.container,
        backgroundColor: color,
        borderWidth: isDragging?4:0,
        borderColor: isDragging?'#ccc':undefined,
        borderStyle: 'solid'
      }}
    />
  );
};

const styles = {
  container: {
    height: MAIN_RADIUS * 2,
    width: MAIN_RADIUS * 2,
    borderRadius: MAIN_RADIUS
  }
}

export { FlowOption };
