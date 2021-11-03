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

  const addAtColumn = (newItem, overlapingItem, index, position = 'left', columnIndex) => {
    if (columnIndex !== undefined) {
      // pega o array de itens dentro da coluna
      let newItems = [...items[columnIndex].items]
      // adiciona o novo item na posição
      const cutPosition = position === 'left' ? index : index + 1;
      let firstPart = newItems.slice(0, cutPosition);
      let secondPart = newItems.slice(cutPosition);
      newItem.y = overlapingItem.y;
      newItems = [...firstPart, newItem, ...secondPart];
      const newHeight = newItems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0)
      // atualiza o array de itens na coluna
      // atualiza o array de items geral com os novos dados da coluna.
      setItems(items.map((item, i) => {
        if ( i === Number(columnIndex) ) {
          return {
            ...item,
            height: newHeight, //utiliza o maior height para a altura das colunas
            items: newItems
          }
        } else if (i > columnIndex ) {
          return {
            ...item,
            y: items[i-1].y + ((i === (Number(columnIndex) + 1)) ? newHeight : items[i-1].height) + DISTANCE_BETWEEN_ELEMENTS
          }
        }
        return item;
      }))
    } else {
      newItem.y = overlapingItem.y;
      const columnIntems = position === 'left' ? [newItem, overlapingItem] : [overlapingItem, newItem];
      const newHeight = columnIntems.reduce((acc, item) => (item.height > acc ? item.height : acc), 0)
      setItems(items.map((item, i) => {
        // essa comparação é apenas com dois == pois o index é em string e o i é em número
        if ( i === Number(index) ) {
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
            y: items[i-1].y + ((i === (Number(index) + 1)) ? newHeight : items[i-1].height) + DISTANCE_BETWEEN_ELEMENTS
          }
        }
        return item;
      }))
    }
  }

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
        addAtColumn(newItem, overlapingItem, index, 'left', columnIndex);
        // finaliza a execução da inserção
        return;
      } else if (relativePosition.x > (shape.attrs.x + (shape.attrs.width - SIZE_OF_SIDE_DROPS))) { // criar coluna ou adiciona dentro da coluna
        // adiciona item novo à direita do item que ele está sobrepondo
        addAtColumn(newItem, overlapingItem, index, 'right', columnIndex);
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

  const newHoveredElement = (index, columnIndex, hoverSide) => {
    if ((hoveredElement.index !== index) || (hoveredElement.columnIndex !== columnIndex) || (hoveredElement.hoverSide !== hoverSide)) {
      setHoveredElement({
        index: index,
        columnIndex: columnIndex,
        hoverSide: hoverSide
      })
    }
  }

  const onDragOver = (shape) => {
    if (shape) {
      const relativePosition = shape.getRelativePointerPosition();
      if (shape.attrs.id) {
        const [index, id, itemType, columnIndex] = shape.attrs.id.split('-');
        if (relativePosition.x < (SIZE_OF_SIDE_DROPS) ) {
          newHoveredElement(index, columnIndex, 'left');
        } else if (relativePosition.x > (shape.attrs.width - SIZE_OF_SIDE_DROPS)) {
          newHoveredElement(index, columnIndex, 'right');
        } else if (relativePosition.y < (shape.attrs.height*0.5)) {
          newHoveredElement(index, columnIndex, 'top');
        } else {
          newHoveredElement(index, columnIndex, 'bottom');
        }
      }
    } else {
      if (hoveredElement.index) setHoveredElement({})
    }
  }

  /**
   * Essa funçao vai receber o index e a coluna se for o caso e substituir onde o hoveredElement indicar que ele tem que cair.
   *
   * No caso de não existir um hovered element, verificar se a posição que ele foi jogado é maior que o valor de y do ultimo item + height do ultimo item,
   * se for maior, jogar o item para o final, se for menor, voltar o item para a posição (provavelmente atualizei os items com a exata mesma lista para causar
   * um re-render).
   */
  const onDropReorder = (index, columnIndex) => {
    console.log('chamou?');
    const itemToReorder = columnIndex ? items[columnIndex].items[index] : items[index];
    // se existe um item sendo sobreposto
    if (hoveredElement.index) {
      switch (hoveredElement.hoverSide) {
        case 'left':
          return;
        case 'right':
          return;
        case 'top':
          return;
        case 'bottom':
          return;
        default:
          return;
      }
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
        onDragMove={onDragOver}
        onDragEnd={onDropReorder}
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
              onDragMove={onDragOver}
              onDragEnd={onDropReorder}
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
      <Layer name="top-layer" />
    </FormDrawerContainer>
  );
};

export { FormDrawer };
