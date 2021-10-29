import React from "react";
import { FormDrawerContainer } from '../../molecules';
import { Rect, Layer } from 'react-konva';
import { SIDEBAR_WIDTH } from "../../../utils/constants";

const FormDrawer = ({optionDraged}) => {
  const DISTANCE_BETWEEN_ELEMENTS = 10;
  const DRAWING_PADDING = 150;
  const TOTAL_WIDTH = (window.innerWidth - SIDEBAR_WIDTH - (DRAWING_PADDING * 2));
  const [items, setItems] = React.useState([]);

  const calculateHeight = (arr) => arr.reduce((acc, current, i, arr) => (acc + (current.y !== arr[i-1]?.y ? current.height + DISTANCE_BETWEEN_ELEMENTS : 0)), 0)

  const contentHeight = React.useMemo(() => (calculateHeight(items)), [items]);


  // TODO: corrigir problema no drop de itens exatamente no meio de dois itens
  // TODO: corrigir problema no drop de itens abaixo/acima de um item no meio da coluna
  const onDropNewItem = (position) => {
    const index = items.findIndex( item => ( ((position.x < (item.x + item.width)) && (position.x > item.x)) && (position.y > item.y && (position.y < (item.y + item.height))) ) );
    const newItem = {
      ...optionDraged,
      id: Date.now(),
      x: DRAWING_PADDING
    }
    if (index !== -1) {
      const overlapingItem = items[index];
      let firstPart;
      let secondPart;

      // TODO: melhorar esse conjunto de ifs para pegar quadrantes melhores dos itens
      // posicionar à esquerda no array
      if ((position.y < (overlapingItem.y + (overlapingItem.height - 100))) || (position.x < (overlapingItem.x + 100))) {
        firstPart = items.slice(0, index);
        secondPart = items.slice(index)
        // posicionar à direita no array
      } else {
        firstPart = items.slice(0, index + 1);
        secondPart = items.slice(index + 1)
      }

      // array that will be the new state
      let toUpdate;

      //posicionar à direita
      if ( (position.x > (overlapingItem.x + (overlapingItem.width-100))) || (position.x < (overlapingItem.x + 100)) ) {
        newItem.y = overlapingItem.y;

        //junta todos os itens iniciais e o da coluna na primeira parte
        firstPart = firstPart.concat(newItem, secondPart.filter(item => item.y === overlapingItem.y));
        secondPart = secondPart.filter(item => item.y !== overlapingItem.y);
        // pegar todos os itens da linha que está sendo modificada
        let same_line_items = firstPart.filter(item => item.y === overlapingItem.y);
        // remove todos os itens da linha da primeira parte
        firstPart = firstPart.filter(item => item.y !== overlapingItem.y);
        // largura do item que é o total, menos a distância interna entre os itens e tudo sendo dividido pela quantidade de itens
        const item_width = ((TOTAL_WIDTH-(DISTANCE_BETWEEN_ELEMENTS * (same_line_items.length - 1)))/same_line_items.length);
        const max_height = same_line_items.reduce((acc, item) => (item.height > acc ? item.height : acc), 0);
        same_line_items = same_line_items.map((item, i) => ({
          ...item,
          width: (item.y === overlapingItem.y) ? item_width : item.width,
          x: (item.y === overlapingItem.y) ? ((DRAWING_PADDING + (item_width+DISTANCE_BETWEEN_ELEMENTS) * (i) )) : item.x,
          height: (item.y === overlapingItem.y) ? max_height : item.height
        }))
        newItem.height = max_height;

        firstPart = firstPart.concat(same_line_items);

      } else {
        newItem.y = calculateHeight(firstPart);
        newItem.width = TOTAL_WIDTH;
        firstPart.push(newItem);
      }
      // atualiza a posição dos itens da parte final, levando em consideração os itens da mesma linha devem descer juntos
      const secondPartInitialHeight = newItem.y + newItem.height + DISTANCE_BETWEEN_ELEMENTS;
      let isASequencie = false;
      for (let i = 0; i < secondPart.length; i++) {
        const currentY = secondPart[i].y;
        if (i === 0) {
          secondPart[i].y = secondPartInitialHeight;
        } else {
          secondPart[i].y = isASequencie ? secondPart[i-1].y : secondPart[i-1].y + secondPart[i-1].height + DISTANCE_BETWEEN_ELEMENTS;
        }
        if ( currentY === secondPart[i+1]?.y) {
          isASequencie = true;
        } else {
          isASequencie = false;
        }
      }

      toUpdate = firstPart.concat(secondPart);
      setItems(toUpdate);

      return;
    }
    newItem.y = contentHeight;
    newItem.width = TOTAL_WIDTH;
    setItems([...items, newItem])
  }

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
            onClick={(e) => {console.log({
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
              event: e
            })}}
          />
        )}
      </Layer>
    </FormDrawerContainer>
  );
};

export { FormDrawer };
