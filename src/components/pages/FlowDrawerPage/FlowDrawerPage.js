import React from "react";
import { FlowDrawer, FlowSideBar } from "../../organisms";

const FlowDrawerPage = () => {
  const [optionDraged, setOptionDrag] = React.useState(null);

  return (
    <div style={styles.contentContainer}>
      <FlowSideBar onDragOptionStart={(option) => {setOptionDrag(option)}}/>
      <FlowDrawer optionDraged={optionDraged}/>
    </div>
  );
};

const styles = {
  contentContainer: {
    display: 'flex'
  }
}

export { FlowDrawerPage };
