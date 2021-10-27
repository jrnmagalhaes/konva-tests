import React from "react";
import { Stage } from 'react-konva';
import background from '../../../assets/images/+.png'

const DrawerContainer = ({children}) => {
  return (
    <Stage style={styles.stageBackground} width={window.innerWidth} height={window.innerHeight}>
      {children}
    </Stage>
  );
};

const styles = {
  stageBackground: {
    backgroundImage: `url(${background})`
  }
}

export { DrawerContainer };
