import React from "react";
import { HEADER_SIZE } from '../../../utils/constants';

const Header = () => {
  return (
    <div style={style.header}>
      <h1 style={style.h1}>Header</h1>
    </div>
  );
};

const style = {
  header: {
    background: "linear-gradient(270deg, #5432CA 0%, #2F80ED 50.04%), #2F80ED",
    height: HEADER_SIZE,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10
  },
  h1: {
    margin: 0,
    color: 'white'
  }
}

export { Header };
