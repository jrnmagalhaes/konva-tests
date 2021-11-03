import React from "react";
import { Rect, Group } from 'react-konva';
import { DISTANCE_BETWEEN_ELEMENTS } from "../../../utils/constants";
import { Portal } from 'react-konva-utils';

/**
 * Basicamente isso agrupa o item a uma colision box, se o item estiver dentro de uma estrutura de colunas, o item vai ficar exatamente em cima da colision box.
 *
 * A estrutura do id vai ser usada para identificar onde um novo item solto está sendo solto.
 *
 * Estrutura do id: index do array em que ele esta inserido - id do item de fato - tipo do item - id da coluna se for o caso
 *
 * Ou seja, ao splitar o index, se o array tive 4 posições, se trata de um item dentro de uma coluna
 */
const FormItem = ({id, index, x, y, width, height, fill, columnIndex, onClick, hoverSide, onDragMove, onDragEnd}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const HOVERCOLOR = '#cccccccc';
  const renderHover = () => {
    if (isDragging) return null;
    switch (hoverSide) {
      case 'left':
        return <Rect
          id={`${index}-${id}-hoverleft${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
          x={0}
          y={columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)}
          fill={HOVERCOLOR}
          width={DISTANCE_BETWEEN_ELEMENTS}
          height={height}
        />
      case 'right':
        return <Rect
          id={`${index}-${id}-hoverright${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
          x={width-DISTANCE_BETWEEN_ELEMENTS}
          y={columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)}
          fill={HOVERCOLOR}
          width={DISTANCE_BETWEEN_ELEMENTS}
          height={height}
        />
      case 'top':
        return <Rect
          id={`${index}-${id}-hovertop${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
          x={0}
          y={columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)}
          fill={HOVERCOLOR}
          width={width}
          height={DISTANCE_BETWEEN_ELEMENTS}
        />
      case 'bottom':
        return <Rect
          id={`${index}-${id}-hoverbottom${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
          x={0}
          y={height - (DISTANCE_BETWEEN_ELEMENTS/2)}
          fill={HOVERCOLOR}
          width={width}
          height={DISTANCE_BETWEEN_ELEMENTS}
        />
      default:
        return null;
    }
  }
  const onDrag = (e) => {
    const target = e.target;
    const stage = target.getStage();
    const intersectedShape = stage.getIntersection(stage.getPointerPosition());
    if (intersectedShape?.attrs.id) {
      const [i, id, type, column] = intersectedShape.attrs.id.split('-');
      if (column == columnIndex && i == index) {
        return
      }
      onDragMove(intersectedShape);
    }
  }

  const dragEnd = () => {
    setIsDragging(false);
    onDragEnd(index, columnIndex);
  }

  return (
    <Group
      x={x}
      y={columnIndex ? 0 : (y - (DISTANCE_BETWEEN_ELEMENTS/2)) }
      id={`${index}-${id}-group${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
      width={width}
      height={columnIndex ? height : (height + DISTANCE_BETWEEN_ELEMENTS) }
    >
      {/* Esse aqui é uma colision box */}
      <Rect
        id={`${index}-${id}-colisionbox${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
        x={0}
        y={0}
        width={width}
        height={columnIndex ? height : (height + DISTANCE_BETWEEN_ELEMENTS) }
      />
      {/* Esse é a representação do item de fato */}
      <Portal id={`${index}-${id}-group${columnIndex !== undefined ? `-${columnIndex}` : ''}`} selector=".top-layer" enabled={isDragging}>
        <Rect
          id={`${index}-${id}-formitem${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
          fill={fill}
          width={width}
          height={height}
          draggable
          x={0}
          y={columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)}
          opacity={isDragging?0.8:1}
          onClick={onClick}
          onDragStart={() => {setIsDragging(true)}}
          onDragMove={onDrag}
          onDragEnd={dragEnd}
        />
      </Portal>
      {/* Hovers */}
      {renderHover()}
    </Group>
  );
};

export { FormItem };
