import React from "react";
import { FlowOption } from "../../atoms";

const OptionList = ({options, onDragOptionStart}) => {
  return (
    <div style={styles.container}>
      {options.map(option => <FlowOption onDragStart={() => onDragOptionStart(option)} key={`option-list-${option.id}`} color={option.color}/>)}
    </div>
  );
};

const styles = {
  container: {
    paddingTop: 24,
    paddingLeft: 28,
    paddingRight: 28,
    paddingBottom: 32,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
}

export { OptionList };
