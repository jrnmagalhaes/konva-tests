import React from "react";
import { SideBarContainer } from "../../atoms";
import { OptionList } from "../../molecules";

const FormSideBar = ({onDragOptionStart}) => {
  const OPTIONS = [
    {id: 1, color: '#56CCF2', height: 100, type: 'input'},
    {id: 2, color: '#F2C94C', height: 300, type: 'section'},
    {id: 3, color: '#9B51E0', height: 50, type: 'label'},
  ]
  return (
    <SideBarContainer>
      <OptionList onDragOptionStart={onDragOptionStart} options={OPTIONS}/>
    </SideBarContainer>
  );
};

export { FormSideBar };
