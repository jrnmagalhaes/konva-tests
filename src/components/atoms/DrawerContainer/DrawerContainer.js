import React from "react";
import { Stage } from 'react-konva';
import background from '../../../assets/images/+.png'
import { HEADER_SIZE, SIDEBAR_WIDTH } from "../../../utils/constants";

const DrawerContainer = ({children, onDrop}) => {
  const stageRef = React.useRef(null)

  const onDropEvent = (e) => {
    stageRef.current.setPointersPositions(e);

    onDrop(stageRef.current.getPointerPosition());
  }

  return (
    <div onDragOver={(e) => {e.preventDefault()}} onDrop={onDropEvent} style={{width: window.innerWidth - SIDEBAR_WIDTH, height: window.innerHeight - HEADER_SIZE}}>
      <Stage ref={ref => (stageRef.current = ref)} style={styles.stageBackground} width={window.innerWidth - SIDEBAR_WIDTH} height={window.innerHeight - HEADER_SIZE}>
        {children}
      </Stage>
    </div>
  );
};

const styles = {
  stageBackground: {
    backgroundImage: `url(${background})`
  }
}

export { DrawerContainer };
