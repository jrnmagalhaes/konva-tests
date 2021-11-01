import React from "react";
import { FormColumn, FormDrawerContainer, FormItem } from '../../molecules';
import { Layer } from 'react-konva';
import { SIDEBAR_WIDTH, DISTANCE_BETWEEN_ELEMENTS, DRAWING_PADDING } from "../../../utils/constants";

const FormDrawer = ({optionDraged}) => {
  const TOTAL_WIDTH = (window.innerWidth - SIDEBAR_WIDTH - (DRAWING_PADDING * 2));
  const [items, setItems] = React.useState([]);

  const calculateHeight = (arr) => arr.reduce((acc, current, i, arr) => (acc + (current.y !== arr[i-1]?.y ? current.height + DISTANCE_BETWEEN_ELEMENTS : 0)), 0)

  const contentHeight = React.useMemo(() => (calculateHeight(items)), [items]);

  // TODO: corrigir bug no resize após um item virar uma coluna
  const onDropNewItem = (shape) => {
    const newItem = {
      ...optionDraged,
      id: Date.now(),
      x: DRAWING_PADDING,
      type: 'formitem'
    }
    if (shape) {
      const relativePosition = shape.getRelativePointerPosition();
      // em caso de dúvida, olhar a formulação do id dentro do FormItem
      const [index, id, itemType, columnIndex] = shape.attrs.id.split('-');

      // se estiver dentro de uma coluna, acessar o item dentro da coluna
      const overlapingItem = columnIndex ? items[columnIndex].items[index] : items[index];
      let firstPart;
      let secondPart;

      // TODO: corrigir bug no posicionamento entre estruturas
      // aqui utilizamos as dimensões do shape na comparação porque se for uma coluna a altura do item não vai corresponder a altura de desenho
      if (relativePosition.x < (shape.attrs.x + 50) ) { // criar coluna ou adicionar dentro da coluna:
        // adicionar novo item à esquerda do item que ele está sobrepondo
        if (columnIndex !== undefined) {
          // pega o array de itens dentro da coluna
          let newItems = [...items[columnIndex].items]
          // adiciona o novo item na posição
          firstPart = newItems.slice(0, index);
          secondPart = newItems.slice(index);
          newItem.y = overlapingItem.y;
          newItems = [...firstPart, newItem, ...secondPart];
          console.log(newItems);
          // atualiza o array de itens na coluna
          // atualiza o array de items geral com os novos dados da coluna.
          setItems(items.map((item, index) => {
            if (index == columnIndex) {
              return {
                ...item,
                height: newItems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0), //utiliza o maior height para a altura das colunas
                items: newItems
              }
            }
            return item;
          }))
        } else {
          newItem.y = overlapingItem.y;
          const columnIntems = [newItem, overlapingItem];
          setItems(items.map((item, i) => {
            // essa comparação é apenas com dois == pois o index é em string e o i é em número
            if ( i == index ) {
              return {
                id: Date.now(),
                type: 'column',
                y: item.y,
                x: item.x,
                height: columnIntems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0), //utiliza o maior height para a altura das colunas
                items: columnIntems
              }
            }
            return item;
          }))
        }
        // finaliza a execução da inserção
        return;
      } else if (relativePosition.x > (shape.attrs.x + (shape.attrs.width - 50))) { // criar coluna ou adiciona dentro da coluna
        // adiciona item novo à direita do item que ele está sobrepondo
        if (columnIndex !== undefined) {
          // pega o array de itens dentro da coluna
          let newItems = [...items[columnIndex].items]
          // adiciona o novo item na posição
          firstPart = newItems.slice(0, index + 1);
          secondPart = newItems.slice(index + 1);
          newItem.y = overlapingItem.y;
          newItems = [...firstPart, newItem, ...secondPart];
          // atualiza o array de itens na coluna
          // atualiza o array de items geral com os novos dados da coluna.
          setItems(items.map((item, index) => {
            if (index == columnIndex) {
              return {
                ...item,
                height: newItems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0), //utiliza o maior height para a altura das colunas
                items: newItems
              }
            }
            return item;
          }))
        } else {
          newItem.y = overlapingItem.y;
          const columnIntems = [overlapingItem, newItem];
          setItems(items.map((item, i) => {
            // essa comparação é apenas com dois == pois o index é em string e o i é em número
            if ( i == index ) {
              return {
                ...item,
                id: Date.now(),
                type: 'column',
                height: columnIntems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0), //utiliza o maior height para a altura das colunas
                items: columnIntems
              }
            }
            return item;
          }))
        }
        // finaliza a execução da inserção
        return;
      } else if (relativePosition.y < (shape.attrs.y + (shape.attrs.height*0.5))) { // item acima da posição
        firstPart = items.slice(0, columnIndex ?? index);
        secondPart = items.slice(columnIndex ?? index)
      } else { // adiciona abaixo
        firstPart = items.slice(0, Number(columnIndex ?? index) + 1);
        secondPart = items.slice(Number(columnIndex ?? index) + 1)
      }
      // array that will be the new state
      let toUpdate;

      newItem.y = calculateHeight(firstPart);
      newItem.width = TOTAL_WIDTH;
      firstPart.push(newItem);
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

  const renderColumnItems = (column, columnIndex) => {
    const item_width = ((TOTAL_WIDTH-(DISTANCE_BETWEEN_ELEMENTS * (column.items.length - 1)))/column.items.length);
    return column.items.map((item, index) =>
      <FormItem
        key={`form-item-${item.id}-column-${column.id}`}
        id={item.id}
        index={index}
        x={((item_width+DISTANCE_BETWEEN_ELEMENTS) * (index) )}
        y={0}
        height={column.height}
        columnIndex={columnIndex}
        width={item_width}
        fill={item.color}
      />
    )
  }

  return (
    <FormDrawerContainer onDrop={onDropNewItem} onItemDrag={() => {}} contentHeight={contentHeight}>
      <Layer>
        {items.map((item, index) =>
          item.type === 'formitem' ?
            <FormItem
              key={`form-item-${item.id}`}
              id={item.id}
              index={index}
              x={DRAWING_PADDING}
              y={item.y}
              height={item.height}
              width={TOTAL_WIDTH}
              fill={item.color}
            />
            :
            <FormColumn
              key={`form-column-${item.id}`}
              id={item.id}
              index={index}
              x={DRAWING_PADDING}
              y={item.y}
              height={item.height}
              width={TOTAL_WIDTH}
            >
              {renderColumnItems(item, index)}
            </FormColumn>
        )}
      </Layer>
    </FormDrawerContainer>
  );
};

export { FormDrawer };
