import React from "react";
import { FormDrawerContainer } from '../../molecules';
import { Rect, Layer } from 'react-konva';

const FormDrawer = ({optionDraged}) => {
  const [items, setItems] = React.useState([]);

  const contentHeight = React.useMemo(() => (items.length > 0) ? (items.reduce((acc, current) => (acc + current.height), 0) + (items.length * 10 )) : 0, [items]);

  const onDropNewItem = (position) => {
    console.log('position: ', position);
    console.log('item: ', optionDraged);
    console.log('contentHeight: ', contentHeight);
    setItems([...items, {
      ...optionDraged,
      id: Date.now(),
      x: 100,
      y: contentHeight
    }])
  }

  React.useEffect(() => {
    console.log(items);
  }, [items]);

  return (
    <FormDrawerContainer onDrop={onDropNewItem} onItemDrag={() => {}} contentHeight={contentHeight}>
      <Layer>
        {items.map(item =>
          <Rect
            key={`form-item-${item.id}`}
            x={item.x}
            y={item.y}
            height={item.height}
            width={100}
            fill={item.color}
          />
        )}
      </Layer>
    </FormDrawerContainer>
  );
};

export { FormDrawer };
