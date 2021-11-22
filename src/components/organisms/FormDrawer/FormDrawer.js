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

  const resizeTree = (items, layer = 0, current_width = TOTAL_WIDTH) => {
    for (let i = 0; i < items.length; i++) {
      items[i].x = layer === 0 ? DRAWING_PADDING : SECTION_PADDING;
      items[i].width = layer === 0 ? current_width : (current_width - (2*SECTION_PADDING));
      if (i === 0) {
        items[i].y = layer === 0 ? 10 : SECTION_PADDING;
      } else {
        items[i].y =  items[i-1].y + items[i-1].height + DISTANCE_BETWEEN_ELEMENTS;
      }
      if (items[i].type === 'section') {
        items[i].height = items[i].items.length > 0 ? (resizeTree(items[i].items, layer+1, items[i].width) + (2*SECTION_PADDING)) : SECTION_DEFAULT_HEIGHT;
      } else if (items[i].type === 'column') {
        items[i].width = layer !== 0 ? (current_width - (2*SECTION_PADDING)) : current_width;
        let taller = 0;
        let item_width = ((items[i].width-(DISTANCE_BETWEEN_ELEMENTS * (items[i].items.length - 1)))/items[i].items.length);
        // percorre todos os itens para descobrir o maior e no caso de um dos itens ser uma section, atualiza a altura da section
        for (let j = 0; j < items[i].items.length; j++) {
          items[i].items[j].width = item_width;
          if (items[i].items[j].type === 'section') {
            items[i].items[j].height =
              items[i].items[j].items.length > 0 ?
                (resizeTree(items[i].items[j].items, layer+1, item_width) + (2*SECTION_PADDING))
                :
                SECTION_DEFAULT_HEIGHT
          }
          if (items[i].items[j].height > taller) {
            taller = items[i].items[j].height
          }
        }
        items[i].height = taller;
        // desconstrói a coluna caso a quantidade de itens seja apenas um.
        if (items[i].items.length === 1) {
          items[i].type = items[i].items[0].type;
          items[i].id = items[i].items[0].id;
          items[i].color = items[i].items[0].color;
          items[i].items = items[i].items[0].items; // caso seja uma section, atualiza os items, caso não seja, será undefined
        }
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
      let fatherRow = null;
      // verifica se o accIndex é diferente de '', se for irá percorrer todos os indexes e buscar em que nó da árvore o item será inserido
      if (hoveredElement.accIndex !== '') {
        const indexes = hoveredElement.accIndex.split('-');
        for (let i = 0; i < indexes.length; i++) {
          if (i === 0) {
            fatherRow = newItems;
            father = newItems[indexes[i]];
          } else {
            fatherRow = father.items;
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
          if ( (father !== null) && father.type === 'column' ) {
            const fatherIndex = hoveredElement.accIndex.split('-').pop();
            newItem.width = fatherRow[fatherIndex].width;
            addItemInPosition(fatherRow, newItem, (Number(fatherIndex)));
            break;
          }
          newItem.width = itemsToChange[hoveredElement.index].width
          addItemInPosition(itemsToChange, newItem, hoveredElement.index);
          break;
        case 'bottom':
          if ( (father !== null) && father.type === 'column' ) {
            const fatherIndex = hoveredElement.accIndex.split('-').pop();
            newItem.width = fatherRow[fatherIndex].width;
            addItemInPosition(fatherRow, newItem, (Number(fatherIndex) + 1));
            break;
          }
          newItem.width = itemsToChange[hoveredElement.index].width
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

  // TODO: refazer para utilizar o index acumulado
  /**
   * Essa funçao vai receber o index e o index acumulado se for o caso e substituir onde o hoveredElement indicar que ele tem que cair.
   *
   * No caso de não existir um hovered element, verificar se a posição que ele foi jogado é maior que o valor de y do ultimo item + height do ultimo item,
   * se for maior, jogar o item para o final, se for menor, voltar o item para a posição (provavelmente atualizei os items com a exata mesma lista para causar
   * um re-render).
   */
  const onDropReorder = (index, accIndex) => {
    // deep copy the items
    let newItems = JSON.parse(JSON.stringify(items));
    let itemToRelocate = null;
    // remove the item from its older position
    if (Number(hoveredElement.index) !== index || hoveredElement.accIndex !== accIndex) {
      if (accIndex !== '') {
        const indexes = accIndex.split('-');
        let father = null;
        for (let i = 0; i < indexes.length; i++) {
          if (i === 0) {
            father = newItems[indexes[i]];
          } else {
            father = father.items[indexes[i]];
          }
        }
        itemToRelocate = father.items[index];
        father.items = father.items.filter((_, i) => i !== Number(index));
      } else {
        itemToRelocate = newItems[index];
        newItems = newItems.filter((_, i) => i !== Number(index));
      }

      let itemsToChange = newItems;
      let father = null;
      let fatherRow = null;
      let subtractLayer = 1; // essa variável indica em qual layer a remoção aconteceu.
      // verifica se o accIndex é diferente de '', se for irá percorrer todos os indexes e buscar em que nó da árvore o item será inserido
      if (hoveredElement.accIndex !== '') {
        if(hoveredElement.accIndex.match("^"+accIndex) && accIndex) subtractLayer = accIndex.split('-').length + 1; // a layer é somada com 1 por conta do index final.
        console.log("ACCINDEX:", accIndex);
        console.log("SUBTRACT LAYER:", subtractLayer);
        const indexes = hoveredElement.accIndex.split('-');
        // o index i do for somado com 1 indica a layer;
        for (let i = 0; i < indexes.length; i++) {
          let currentIndex = Number(indexes[i]);
          // verifica se existe um subtract layer compatível com a layer atual atualiza o current index se o index for menor
          if ((i+1) === subtractLayer && (index < currentIndex)) currentIndex -= 1;
          if (i === 0) {
            fatherRow = newItems;
            father = newItems[currentIndex];
          } else {
            fatherRow = father.items;
            father = father.items[currentIndex];
          }
          console.log("CURRENT INDEX: ", currentIndex);
          console.log("FATHER ROW: ", fatherRow)
          console.log("FATHER: ", father)
        }
        itemsToChange = father.items ?? null;
      }
      switch (hoveredElement.hoverSide) {
        case 'left':
          if ( (father !== null) && father.type === 'column' ) {
            addToColumn(itemsToChange, itemToRelocate, hoveredElement.index, 'left');
          } else {
            createColumn(itemsToChange, itemToRelocate, hoveredElement.index, 'left');
          }
          break;
        case 'right':
          if ( (father !== null) && father.type === 'column' ) {
            addToColumn(itemsToChange, itemToRelocate, hoveredElement.index, 'right');
          } else {
            createColumn(itemsToChange, itemToRelocate, hoveredElement.index, 'right');
          }
          break;
        case 'top':
          if ( (father !== null) && father.type === 'column' ) {
            const fatherIndex = hoveredElement.accIndex.split('-').pop();
            itemToRelocate.width = fatherRow[fatherIndex].width;
            addItemInPosition(fatherRow, itemToRelocate, (Number(fatherIndex)));
            break;
          }
          itemToRelocate.width = itemsToChange[hoveredElement.index].width
          addItemInPosition(itemsToChange, itemToRelocate, hoveredElement.index);
          break;
        case 'bottom':
          let addFactor = 1;
          if ((accIndex === hoveredElement.accIndex) && (index < Number(hoveredElement.index))) addFactor = 0;
          if ( (father !== null) && father.type === 'column' ) {
            const fatherIndex = hoveredElement.accIndex.split('-').pop();
            addItemInPosition(fatherRow, itemToRelocate, (Number(fatherIndex) + addFactor));
            break;
          }
          addItemInPosition(itemsToChange, itemToRelocate, (Number(hoveredElement.index) + addFactor));
          break;
        case 'middle':
          console.log(itemsToChange);
          itemsToChange = itemsToChange[ ((accIndex === hoveredElement.accIndex) && (index < Number(hoveredElement.index))) ? (Number(hoveredElement.index) - 1) : hoveredElement.index].items;
          itemsToChange.push(itemToRelocate);
          break;
        default:
          return;
      }
      resizeTree(newItems);
      setItems(newItems);
      return;

    } else {
      // force redraw
      setItems([]);
      setItems(newItems);
    }
    // add to new position based on hoveredelement
  }

  const renderColumnItems = (column, accIndex, column_width) => {
    return column.items.map((item, index) =>
      item.type === 'section' ?
        <FormItem
          key={`form-item-${item.id}`}
          id={item.id}
          index={index}
          x={((item.width+DISTANCE_BETWEEN_ELEMENTS) * (index) )}
          y={0}
          height={column.height}
          width={item.width}
          accIndex={accIndex}
          hoverSide={(Number(hoveredElement.index) === index && hoveredElement.accIndex === accIndex) ? hoveredElement.hoverSide : undefined}
          fill={item.color}
          type={item.type}
          onDragMove={onDragOver}
          onDragEnd={onDropReorder}
        >
          {renderItems(item.items, `${accIndex !== '' ? accIndex+'-' : ''}${index}`)}
        </FormItem>
      :
      <FormItem
        key={`form-item-${item.id}-column-${column.id}`}
        id={item.id}
        index={index}
        x={((item.width+DISTANCE_BETWEEN_ELEMENTS) * (index) )}
        y={0}
        height={column.height}
        hoverSide={((Number(hoveredElement.index) === index) && (accIndex === hoveredElement.accIndex)) ? hoveredElement.hoverSide : undefined}
        accIndex={accIndex}
        width={item.width}
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
              width={item.width}
            >
              {renderColumnItems(item, `${accIndex !== '' ? accIndex+'-' : ''}${index}`, item.width)}
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
              width={item.width ?? 10}
              accIndex={accIndex}
              hoverSide={(Number(hoveredElement.index) === index && hoveredElement.accIndex === accIndex) ? hoveredElement.hoverSide : undefined}
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
              hoverSide={(Number(hoveredElement.index) === index && hoveredElement.accIndex === accIndex) ? hoveredElement.hoverSide : undefined}
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
