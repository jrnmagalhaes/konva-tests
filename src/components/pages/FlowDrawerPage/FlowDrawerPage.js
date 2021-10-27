import React from "react";
import { Header } from "../../atoms";
import { FlowDrawer, FlowSideBar } from "../../organisms";

const FlowDrawerPage = () => {
  const [optionDraged, setOptionDrag] = React.useState(null);

  return (
    <>
      <Header/>
      <div style={styles.contentContainer}>
        <FlowSideBar onDragOptionStart={(option) => {setOptionDrag(option)}}/>
        <FlowDrawer optionDraged={optionDraged}/>
      </div>
    </>
  );
};

const styles = {
  contentContainer: {
    display: 'flex'
  }
}

export { FlowDrawerPage };
