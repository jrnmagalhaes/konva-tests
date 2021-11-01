import React from "react";
import { FormColumn, FormDrawerContainer, FormItem } from '../../molecules';
import { Layer } from 'react-konva';
import { SIDEBAR_WIDTH, DISTANCE_BETWEEN_ELEMENTS, DRAWING_PADDING } from "../../../utils/constants";

const FormDrawer = ({optionDraged}) => {
  const TOTAL_WIDTH = (window.innerWidth - SIDEBAR_WIDTH - (DRAWING_PADDING * 2));
  // isso é o tamanho em pixels que o algoritmo usa para reconhecer se o pointer está numa lateral de um shape
  const SIZE_OF_SIDE_DROPS = 80;
  const [items, setItems] = React.useState([]);
  const [hoveredElement, setHoveredElement] = React.useState({});

  React.useEffect(() => {
    setHoveredElement({})
  }, [items])

  const calculateHeight = (arr) => arr.reduce((acc, current, i, arr) => (acc + (current.y !== arr[i-1]?.y ? current.height + DISTANCE_BETWEEN_ELEMENTS : 0)), 0)

  const contentHeight = React.useMemo(() => (calculateHeight(items)), [items]);

  // TODO: clean up this shit
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

      // aqui utilizamos as dimensões do shape na comparação porque se for uma coluna a altura do item não vai corresponder a altura de desenho
      if (relativePosition.x < (shape.attrs.x + SIZE_OF_SIDE_DROPS) ) { // criar coluna ou adicionar dentro da coluna:
        // adicionar novo item à esquerda do item que ele está sobrepondo
        if (columnIndex !== undefined) {
          // pega o array de itens dentro da coluna
          let newItems = [...items[columnIndex].items]
          // adiciona o novo item na posição
          firstPart = newItems.slice(0, index);
          secondPart = newItems.slice(index);
          newItem.y = overlapingItem.y;
          newItems = [...firstPart, newItem, ...secondPart];
          const newHeight = newItems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0)
          // atualiza o array de itens na coluna
          // atualiza o array de items geral com os novos dados da coluna.
          setItems(items.map((item, i) => {
            if (i == columnIndex) {
              return {
                ...item,
                height: newHeight, //utiliza o maior height para a altura das colunas
                items: newItems
              }
            } else if (i > columnIndex ) {
              return {
                ...item,
                y: items[i-1].y + ((i == Number(columnIndex) + 1) ? newHeight : items[i-1].height) + DISTANCE_BETWEEN_ELEMENTS
              }
            }

            return item;
          }))
        } else {
          newItem.y = overlapingItem.y;
          const columnIntems = [newItem, overlapingItem];
          const newHeight = columnIntems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0)
          setItems(items.map((item, i) => {
            // essa comparação é apenas com dois == pois o index é em string e o i é em número
            if ( i == index ) {
              return {
                id: Date.now(),
                type: 'column',
                y: item.y,
                x: item.x,
                height: newHeight,
                items: columnIntems
              }
            } else if (i > index) {
              return {
                ...item,
                y: items[i-1].y + ((i == Number(index) + 1) ? newHeight : items[i-1].height) + DISTANCE_BETWEEN_ELEMENTS
              }
            }
            return item;
          }))
        }
        // finaliza a execução da inserção
        return;
      } else if (relativePosition.x > (shape.attrs.x + (shape.attrs.width - SIZE_OF_SIDE_DROPS))) { // criar coluna ou adiciona dentro da coluna
        // adiciona item novo à direita do item que ele está sobrepondo
        if (columnIndex !== undefined) {
          // pega o array de itens dentro da coluna
          let newItems = [...items[columnIndex].items]
          // adiciona o novo item na posição
          firstPart = newItems.slice(0, index + 1);
          secondPart = newItems.slice(index + 1);
          newItem.y = overlapingItem.y;
          newItems = [...firstPart, newItem, ...secondPart];
          const newHeight = newItems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0)
          // atualiza o array de itens na coluna
          // atualiza o array de items geral com os novos dados da coluna.
          setItems(items.map((item, i) => {
            if (i == columnIndex) {
              return {
                ...item,
                height: newHeight, //utiliza o maior height para a altura das colunas
                items: newItems
              }
            } else if (i > columnIndex ) {
              return {
                ...item,
                y: items[i-1].y + ((i == Number(columnIndex) + 1) ? newHeight : items[i-1].height) + DISTANCE_BETWEEN_ELEMENTS
              }
            }

            return item;
          }))
        } else {
          newItem.y = overlapingItem.y;
          const columnIntems = [overlapingItem, newItem];
          const newHeight = columnIntems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0)
          setItems(items.map((item, i) => {
            // essa comparação é apenas com dois == pois o index é em string e o i é em número
            if ( i == index ) {
              return {
                ...item,
                id: Date.now(),
                type: 'column',
                height: newHeight,
                items: columnIntems
              }
            } else if (i > index) {
              return {
                ...item,
                y: items[i-1].y + ((i == Number(index) + 1) ? newHeight : items[i-1].height) + DISTANCE_BETWEEN_ELEMENTS
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
      for (let i = 0; i < secondPart.length; i++) {
        if (i === 0) {
          secondPart[i].y = secondPartInitialHeight;
        } else {
          secondPart[i].y = secondPart[i-1].y + secondPart[i-1].height + DISTANCE_BETWEEN_ELEMENTS;
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

  const onDragOver = (shape) => {
    if (shape) {
      const relativePosition = shape.getRelativePointerPosition();
      const [index, id, itemType, columnIndex] = shape.attrs.id.split('-');
      if (relativePosition.x < (shape.attrs.x + SIZE_OF_SIDE_DROPS) ) {
        setHoveredElement({
          index: index,
          columnIndex: columnIndex,
          hoverSide: 'left'
        })
      } else if (relativePosition.x > (shape.attrs.width - SIZE_OF_SIDE_DROPS)) {
        setHoveredElement({
          index: index,
          columnIndex: columnIndex,
          hoverSide: 'right'
        })
      } else if (relativePosition.y < (shape.attrs.y + (shape.attrs.height*0.5))) {
        setHoveredElement({
          index: index,
          columnIndex: columnIndex,
          hoverSide: 'top'
        })
      } else {
        setHoveredElement({
          index: index,
          columnIndex: columnIndex,
          hoverSide: 'bottom'
        })
      }
    } else {
      setHoveredElement({})
    }
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
        hoverSide={((hoveredElement.index == index) && (columnIndex == hoveredElement.columnIndex)) ? hoveredElement.hoverSide : undefined}
        columnIndex={columnIndex}
        width={item_width}
        fill={item.color}
      />
    )
  }

  return (
    <FormDrawerContainer onDrop={onDropNewItem} onItemDrag={onDragOver} contentHeight={contentHeight}>
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
              hoverSide={(hoveredElement.index == index && hoveredElement.columnIndex === undefined) ? hoveredElement.hoverSide : undefined}
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
