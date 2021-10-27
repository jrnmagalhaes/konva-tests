import React from "react";
import { MAIN_RADIUS } from "../../../utils/constants";

const FlowOption = ({color, onDragStart}) => {
  return (
    <div draggable onDragStart={onDragStart} style={{...styles.container, backgroundColor: color}}>
    </div>
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
