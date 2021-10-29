import React from "react";
import { FormSideBar, FormDrawer } from "../../organisms";

const FormDrawerPage = () => {
  const [optionDraged, setOptionDrag] = React.useState(null);

  return (
    <div style={styles.contentContainer}>
      <FormSideBar onDragOptionStart={(option) => {setOptionDrag(option)}}/>
      <FormDrawer optionDraged={optionDraged} />
    </div>
  );
};

const styles = {
  contentContainer: {
    display: 'flex'
  }
}

export { FormDrawerPage };
