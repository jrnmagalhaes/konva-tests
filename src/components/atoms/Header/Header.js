import React from "react";
import { HEADER_SIZE } from '../../../utils/constants';
import {
  Link
} from "react-router-dom";

const Header = () => {
  return (
    <div style={style.header}>
      <Link style={style.link} to="/">Fluxo</Link>
      <Link style={style.link} to="/form">form</Link>
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
  link: {
    marginRight: 10
  }
}

export { Header };
