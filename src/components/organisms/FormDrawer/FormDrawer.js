import React from "react";
import { FormDrawerContainer } from '../../molecules';
import { Rect, Layer } from 'react-konva';
import { SIDEBAR_WIDTH } from "../../../utils/constants";

const FormDrawer = ({optionDraged}) => {
  const HEIGHT_DISTANCE_BETWEEN_ELEMENTS = 10;
  const [items, setItems] = React.useState([]);

  const calculateHeight = (arr) => arr.reduce((acc, current) => (acc + current.height), 0) + (arr.length * HEIGHT_DISTANCE_BETWEEN_ELEMENTS )

  const contentHeight = React.useMemo(() => (calculateHeight(items)), [items]);


  const onDropNewItem = (position) => {
    const index = items.findIndex( item => ( ((position.x < (item.x + item.width)) && (position.x > item.x)) && (position.y > item.y && (position.y < (item.y + item.height))) ) );
    const newItem = {
      ...optionDraged,
      id: Date.now(),
      x: 150,
      width: (window.innerWidth - SIDEBAR_WIDTH - 300)
    }
    if (index !== -1) {
      const overlapingItem = items[index];
      let firstPart;
      let secondPart;
      // abaixo no array
      if (position.y < (overlapingItem.y + (overlapingItem.height/2))) {
        firstPart = items.slice(0, index);
        secondPart = items.slice(index)
      // acima no array
      } else {
        firstPart = items.slice(0, index + 1);
        secondPart = items.slice(index + 1)
      }
      newItem.y = calculateHeight(firstPart);
      firstPart.push(newItem);

      const secondPartInitialHeight = newItem.y + newItem.height + HEIGHT_DISTANCE_BETWEEN_ELEMENTS;
      for (let i = 0; i < secondPart.length; i++) {
        if (i === 0) {
          secondPart[i].y = secondPartInitialHeight;
        } else {
          secondPart[i].y = secondPart[i-1].y + secondPart[i-1].height + HEIGHT_DISTANCE_BETWEEN_ELEMENTS;
        }
      }
      setItems(firstPart.concat(secondPart))
      return;
    }
    newItem.y = contentHeight;
    setItems([...items, newItem])
  }

  // React.useEffect(() => {
  //   console.log(items);
  // }, [items]);

  return (
    <FormDrawerContainer onDrop={onDropNewItem} onItemDrag={() => {}} contentHeight={contentHeight}>
      <Layer>
        {items.map(item =>
          <Rect
            key={`form-item-${item.id}`}
            x={item.x}
            y={item.y}
            height={item.height}
            width={item.width}
            fill={item.color}
          />
        )}
      </Layer>
    </FormDrawerContainer>
  );
};

export { FormDrawer };
