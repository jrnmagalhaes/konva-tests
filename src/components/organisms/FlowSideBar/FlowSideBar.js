import React from "react";
import { SideBarContainer } from "../../atoms";
import { OptionList } from "../../molecules";

const FlowSideBar = ({onDragOptionStart}) => {
  const OPTIONS = [
    {id: 1, color: '#56CCF2'},
    {id: 2, color: '#F2C94C'},
    {id: 3, color: '#9B51E0'},
  ]
  return (
    <SideBarContainer>
      <OptionList onDragOptionStart={onDragOptionStart} options={OPTIONS}/>
    </SideBarContainer>
  );
};

export { FlowSideBar };
