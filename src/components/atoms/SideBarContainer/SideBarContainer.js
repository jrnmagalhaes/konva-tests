import React from "react";
import { HEADER_SIZE, SIDEBAR_WIDTH } from '../../../utils/constants';

const SideBarContainer = ({children}) => {
  return (
    <div style={styles.container}>
      {children}
    </div>
  );
};

const styles = {
  container: {
    width: SIDEBAR_WIDTH,
    height: window.innerHeight - HEADER_SIZE,
    backgroundColor: '#EEEDEA',
    paddingTop: 20,
  }
}

export { SideBarContainer };
