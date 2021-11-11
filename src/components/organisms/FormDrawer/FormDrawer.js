import React from "react";
import { FormColumn, FormDrawerContainer, FormItem } from '../../molecules';
import { Layer } from 'react-konva';
import { SIDEBAR_WIDTH, DISTANCE_BETWEEN_ELEMENTS, DRAWING_PADDING, SECTION_PADDING, SECTION_DEFAULT_HEIGHT } from "../../../utils/constants";


const FormDrawer = ({optionDraged}) => {
  const TOTAL_WIDTH = (window.innerWidth - SIDEBAR_WIDTH - (DRAWING_PADDING * 2));
  // isso é o tamanho em pixels que o algoritmo usa para reconhecer se o pointer está numa lateral de um shape
  const SIZE_OF_SIDE_DROPS = 80;
  const [items, setItems] = React.useState([]);
  const [hoveredElement, setHoveredElement] = React.useState({});

  React.useEffect(() => {
    console.log("items:", items);
    setHoveredElement({})
  }, [items])

  const calculateHeight = (arr) => arr.reduce((acc, current, i, arr) => (acc + (current.y !== arr[i-1]?.y ? current.height + DISTANCE_BETWEEN_ELEMENTS : 0)), 10)

  const contentHeight = React.useMemo(() => (calculateHeight(items)), [items]);

  const resizeTree = (items, layer = 0) => {
    for (let i = 0; i < items.length; i++) {
      items[i].x = layer === 0 ? DRAWING_PADDING : SECTION_PADDING;
      if (i === 0) {
        items[i].y = layer === 0 ? 10 : SECTION_PADDING;
      } else {
        items[i].y =  items[i-1].y + items[i-1].height + DISTANCE_BETWEEN_ELEMENTS;
      }
      if (items[i].type === 'section') {
        items[i].height = items[i].items.length > 0 ? (resizeTree(items[i].items, layer+1) + (2*SECTION_PADDING)) : SECTION_DEFAULT_HEIGHT;
      } else if (items[i].type === 'column') {
        items[i].height = items[i].items.reduce((acc, item) => (item.height > acc) ? item.height : acc, 0)
      }
    }
    return calculateHeight(items);
  }

  const addItemInPosition = (items, newItem, index) => {
    const secondPart = items.splice(index);
    items.push(newItem, ...secondPart);
  }

  const addToColumn = (items, newItem, index, position = 'left') => {
    const cutPosition = position === 'left' ? index : index + 1;
    let secondPart = items.splice(cutPosition);
    items.push(newItem, ...secondPart);
  }

  const createColumn = (items, newItem, index, position = 'left') => {
    items[index] = {
      id: Date.now(),
      x: items[index].x,
      y: items[index].y,
      height: [newItem, items[index]].reduce((acc, item) => (item.height > acc) ? item.height : acc, 0),
      type: 'column',
      items: position === 'left' ? [newItem, items[index]] : [items[index], newItem]
    }
    return items;
  }

  const onDropNewItem = () => {
    const newItem = {
      ...optionDraged,
      id: Date.now(),
      x: DRAWING_PADDING,
    }

    if (hoveredElement.index) {
      // faz um deep copy da árvore de items.
      const newItems = JSON.parse(JSON.stringify(items));
      let itemsToChange = newItems;
      let father = null;
      // verifica se o accIndex é diferente de '', se for irá percorrer todos os indexes e buscar em que nó da árvore o item será inserido
      if (hoveredElement.accIndex !== '') {
        const indexes = hoveredElement.accIndex.split('-');
        console.log("indexes: ", indexes);
        for (let i = 0; i < indexes.length; i++) {
          if (i === 0) {
            father = newItems[indexes[i]];
          } else {
            father = father.items[indexes[i]];
          }
        }
        itemsToChange = father.items ?? null;
      }
      switch (hoveredElement.hoverSide) {
        case 'left':
          if ( (father !== null) && father.type === 'column' ) {
            addToColumn(itemsToChange, newItem, hoveredElement.index, 'left');
          } else {
            createColumn(itemsToChange, newItem, hoveredElement.index, 'left');
          }
          break;
        case 'right':
          if ( (father !== null) && father.type === 'column' ) {
            addToColumn(itemsToChange, newItem, hoveredElement.index, 'right');
          } else {
            createColumn(itemsToChange, newItem, hoveredElement.index, 'right');
          }
          break;
        case 'top':
          addItemInPosition(itemsToChange, newItem, hoveredElement.index);
          break;
        case 'bottom':
          addItemInPosition(itemsToChange, newItem, (Number(hoveredElement.index) + 1));
          break;
        case 'middle':
          newItem.width = itemsToChange[hoveredElement.index].width - (2*SECTION_PADDING)
          itemsToChange = itemsToChange[hoveredElement.index].items;
          itemsToChange.push(newItem);
          break;
        default:
          return;
      }
      resizeTree(newItems);
      setItems(newItems);
      return;
    }
    newItem.y = contentHeight;
    newItem.width = TOTAL_WIDTH;
    console.log('newItem:', newItem)
    setItems([...items, newItem])
  }

  const newHoveredElement = (index, accIndex, hoverSide) => {
    if ((hoveredElement.index !== index) || (hoveredElement.accIndex !== accIndex) || (hoveredElement.hoverSide !== hoverSide)) {
      setHoveredElement({
        index: index,
        accIndex: accIndex,
        hoverSide: hoverSide
      })
    }
  }

  const onDragOver = (shape) => {
    if (shape) {
      const {id, width, height} = shape.attrs;
      const relativePosition = shape.getRelativePointerPosition();
      if (id) {
        const indexes = id.split('-');
        const type = indexes.pop();
        const index = indexes.pop();
        const accIndex = (indexes.length > 0) ? indexes.join('-') : '';
        if ( type === 'section' && ((relativePosition.x > SIZE_OF_SIDE_DROPS) && (relativePosition.x < (width - SIZE_OF_SIDE_DROPS)) && (relativePosition.y > (height*0.2) ) && (relativePosition.y < (height*0.8)) ) ) {
          newHoveredElement(index, accIndex, 'middle');
        } else if (relativePosition.x < (SIZE_OF_SIDE_DROPS) ) {
          newHoveredElement(index, accIndex, 'left');
        } else if (relativePosition.x > (width - SIZE_OF_SIDE_DROPS)) {
          newHoveredElement(index, accIndex, 'right');
        } else if (relativePosition.y < (height*0.5)) {
          newHoveredElement(index, accIndex, 'top');
        } else {
          newHoveredElement(index, accIndex, 'bottom');
        }
      }
    } else {
      if (hoveredElement.index) setHoveredElement({})
    }
  }

  /**
   * Atualiza a posição y de todos os itens e das colunas também.
   */
  const reSizeItems = (newItems) => {
    for (let i = 0; i < newItems.length; i++) {
      newItems[i] = {
        ...newItems[i],
        y: i === 0 ? 0 : (newItems[i-1].y + newItems[i-1].height + DISTANCE_BETWEEN_ELEMENTS),
        height: newItems[i].type === 'column' ? newItems[i].items.reduce((acc, item) => (item.height > acc ? item.height : acc), 0) : newItems[i].height
      };
    }
    setItems(newItems);
  }

  /**
   * Nessa função apenas estamos alocando o item na posição correta, não estamos ajustando nenhuma altura, nem nenhum posicionamento
   */
  const reOrderColumn = (newItem, items, index, columnIndex, position = 'left') => {
    if (columnIndex && items[columnIndex].type === 'column') {
      let newItems = [...items[columnIndex].items]
      // adiciona o novo item na posição
      const cutPosition = position === 'left' ? index : index + 1;
      let firstPart = newItems.slice(0, cutPosition);
      let secondPart = newItems.slice(cutPosition);
      newItems = [...firstPart, newItem, ...secondPart];
      // atualiza o array de itens na coluna
      // atualiza o array de items geral com os novos dados da coluna.
      return items.map((item, i) => {
        if ( i === Number(columnIndex) ) {
          return {
            ...item,
            items: newItems
          }
        }
        return item;
      })
    } else {
      return items.map( (item, i) => {
        if (i === Number(index)) {
          return {
            id: Date.now(),
            type: 'column',
            items: position === 'left' ? [newItem, item] : [item, newItem]
          }
        }
        return item
      })
    }
  }


  // TODO: refazer para utilizar o index acumulado
  /**
   * Essa funçao vai receber o index e o index acumulado se for o caso e substituir onde o hoveredElement indicar que ele tem que cair.
   *
   * No caso de não existir um hovered element, verificar se a posição que ele foi jogado é maior que o valor de y do ultimo item + height do ultimo item,
   * se for maior, jogar o item para o final, se for menor, voltar o item para a posição (provavelmente atualizei os items com a exata mesma lista para causar
   * um re-render).
   */
  const onDropReorder = (index, columnIndex) => {
    const itemToReorder = columnIndex !== undefined ? items[columnIndex].items[index] : items[index];
    // remove o item de onde ele estava
    let newItems
    if (columnIndex !== undefined) {
      newItems = items.map((item, i) => {
        if (i === Number(columnIndex)) {
          // isso é para desconstruir a coluna caso necessário
          item.items = item.items.filter((_, insideItemIndex) => insideItemIndex !== Number(index))
          if (item.items.length === 1) {
            return item.items[0];
          }
          return item;
        }
        return item;
      })
    } else {
      newItems = items.filter((item, i) => i !== index);
    }

    // se existe um item sendo sobreposto
    if (hoveredElement.index) {
      let newIndex;
      switch (hoveredElement.hoverSide) {
        case 'left':
          newItems = reOrderColumn(itemToReorder, newItems, hoveredElement.index, hoveredElement.columnIndex, 'left')
          reSizeItems(newItems);
          return;
        case 'right':
          newItems = reOrderColumn(itemToReorder, newItems, hoveredElement.index, hoveredElement.columnIndex, 'right')
          reSizeItems(newItems);
          return;
        case 'top':
          newIndex = Number(hoveredElement.columnIndex ?? hoveredElement.index);
          newItems = addItemInPosition({...itemToReorder}, newItems, newIndex)
          reSizeItems(newItems);
          return;
        case 'bottom':
          newIndex = Number(hoveredElement.columnIndex ?? hoveredElement.index);
          if (newItems.length === items.length) newIndex += 1;
          newItems = addItemInPosition({...itemToReorder}, newItems, newIndex)
          reSizeItems(newItems);
          return;
        default:
          return;
      }
    }
  }

  const renderColumnItems = (column, accIndex) => {
    const item_width = ((TOTAL_WIDTH-(DISTANCE_BETWEEN_ELEMENTS * (column.items.length - 1)))/column.items.length);
    return column.items.map((item, index) =>
      <FormItem
        key={`form-item-${item.id}-column-${column.id}`}
        id={item.id}
        index={index}
        x={((item_width+DISTANCE_BETWEEN_ELEMENTS) * (index) )}
        y={0}
        height={column.height}
        hoverSide={((hoveredElement.index == index) && (accIndex == hoveredElement.accIndex)) ? hoveredElement.hoverSide : undefined}
        accIndex={accIndex}
        width={item_width}
        fill={item.color}
        type={item.type}
        onDragMove={onDragOver}
        onDragEnd={onDropReorder}
      />
    )
  }

  const renderItems = (items, accIndex = '') => {
    return items.map((item, index) => {
      switch (item.type) {
        case 'column':
          return (
            <FormColumn
              key={`form-column-${item.id}`}
              id={item.id}
              index={index}
              x={item.x}
              y={item.y}
              height={item.height}
              width={TOTAL_WIDTH}
            >
              {renderColumnItems(item, `${accIndex !== '' ? accIndex+'-' : ''}${index}`)}
            </FormColumn>
          )
        case 'section':
          return (
            <FormItem
              key={`form-item-${item.id}`}
              id={item.id}
              index={index}
              x={item.x}
              y={item.y}
              height={item.height}
              width={item.width}
              accIndex={accIndex}
              hoverSide={(hoveredElement.index == index && hoveredElement.accIndex === accIndex) ? hoveredElement.hoverSide : undefined}
              fill={item.color}
              type={item.type}
              onDragMove={onDragOver}
              onDragEnd={onDropReorder}
            >
              {renderItems(item.items, `${accIndex !== '' ? accIndex+'-' : ''}${index}`)}
            </FormItem>
          )
        default:
          return (
            <FormItem
              key={`form-item-${item.id}`}
              id={item.id}
              index={index}
              x={item.x}
              y={item.y}
              height={item.height}
              width={item.width}
              hoverSide={(hoveredElement.index == index && hoveredElement.accIndex === accIndex) ? hoveredElement.hoverSide : undefined}
              fill={item.color}
              accIndex={accIndex}
              type={item.type}
              onDragMove={onDragOver}
              onDragEnd={onDropReorder}
            />
          );
      }
    })
  }

  return (
    <FormDrawerContainer onDrop={onDropNewItem} onItemDrag={onDragOver} contentHeight={contentHeight}>
      <Layer>
        {renderItems(items)}
      </Layer>
      <Layer name="top-layer" />
    </FormDrawerContainer>
  );
};

export { FormDrawer };
