/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Rect, Group } from 'react-konva';
import { DISTANCE_BETWEEN_ELEMENTS } from "../../../utils/constants";
import { Portal } from 'react-konva-utils';
import { Section } from "../../atoms";

/**
 * Basicamente isso agrupa o item a uma colision box, se o item estiver dentro de uma estrutura de colunas, o item vai ficar exatamente em cima da colision box.
 *
 * A estrutura do id vai ser usada para identificar onde um novo item solto está sendo solto.
 *
 * Estrutura do id: index do array em que ele esta inserido - id do item de fato - tipo do item - id da coluna se for o caso
 *
 * Ou seja, ao splitar o index, se o array tive 4 posições, se trata de um item dentro de uma coluna
 */
const FormItem = ({id, index, x, y, width, height, fill, columnIndex, onClick, hoverSide, onDragMove, onDragEnd, type}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const rectRef = React.useRef(null);
  const HOVERCOLOR = '#cccccccc';

  React.useEffect(() => {
    rectRef.current.position({
      x: 0,
      y: columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)
    })
  }, [x, y])

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

  const dragEnd = (e) => {
    setIsDragging(false);
    onDragEnd(index, columnIndex);
  }

  const renderBasedOnType = () => {
    switch (type) {
      case 'section':
        return <Section
          id={`${index}-${id}-${type}${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
          width={width}
          height={height}
          draggable
          ref={rectRef}
          x={0}
          y={columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)}
          opacity={isDragging?0.8:1}
          onClick={onClick}
          onDragStart={() => {setIsDragging(true)}}
          onDragMove={onDrag}
          onDragEnd={dragEnd}
        />
      default:
        return <Rect
          id={`${index}-${id}-formitem${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
          fill={fill}
          width={width}
          height={height}
          draggable
          ref={rectRef}
          x={0}
          y={columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)}
          opacity={isDragging?0.8:1}
          onClick={onClick}
          onDragStart={() => {setIsDragging(true)}}
          onDragMove={onDrag}
          onDragEnd={dragEnd}
        />;
    }
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
      {/* Esse portal é para trazer o item para frente quando estiver no estado de drag */}
      <Portal id={`${index}-${id}-group${columnIndex !== undefined ? `-${columnIndex}` : ''}`} selector=".top-layer" enabled={isDragging}>
        {renderBasedOnType()}
      </Portal>
      {/* Hovers */}
      {renderHover()}
    </Group>
  );
};

export { FormItem };
