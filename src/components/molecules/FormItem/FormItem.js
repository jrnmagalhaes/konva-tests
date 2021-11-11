/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { Rect, Group } from 'react-konva';
import { DISTANCE_BETWEEN_ELEMENTS, HOVER_COLOR } from "../../../utils/constants";
import { Portal } from 'react-konva-utils';
import { Section } from "../../atoms";

/**
 * Basicamente isso agrupa o item a uma colision box, se o item estiver dentro de uma estrutura de colunas, o item vai ficar exatamente em cima da colision box.
 *
 * A estrutura do id vai ser usada para identificar onde um novo item solto está sendo solto.
 *
 * Estrutura do id: conjunto de indexes que indicam a localização do item na estrutura de dados.
 *
 */
const FormItem = ({id, index, x, y, width, height, fill, accIndex, onClick, hoverSide, onDragMove, onDragEnd, type, children}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const rectRef = React.useRef(null);

  React.useEffect(() => {
    rectRef.current.position({
      x: 0,
      y: 0
    })
  }, [x, y])

  const renderHover = () => {
    if (isDragging) return null;
    switch (hoverSide) {
      case 'left':
        return <Rect
          id={`${accIndex? accIndex+'-':''}${index}-hoverleft`}
          x={0}
          y={0}
          fill={HOVER_COLOR}
          width={DISTANCE_BETWEEN_ELEMENTS}
          height={height}
        />
      case 'right':
        return <Rect
          id={`${accIndex? accIndex+'-':''}${index}-hoverright`}
          x={width-DISTANCE_BETWEEN_ELEMENTS}
          y={0}
          fill={HOVER_COLOR}
          width={DISTANCE_BETWEEN_ELEMENTS}
          height={height}
        />
      case 'top':
        return <Rect
          id={`${accIndex? accIndex+'-':''}${id}-hovertop`}
          x={0}
          y={0}
          fill={HOVER_COLOR}
          width={width}
          height={DISTANCE_BETWEEN_ELEMENTS}
        />
      case 'bottom':
        return <Rect
          id={`${accIndex? accIndex+'-':''}${index}-hoverbottom`}
          x={0}
          y={height - (DISTANCE_BETWEEN_ELEMENTS)}
          fill={HOVER_COLOR}
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
      const indexes = intersectedShape.attrs.id.split('-');
      const i = indexes.pop();
      if (indexes.join('-') === accIndex && Number(i) === index) {
        return
      }
      onDragMove(intersectedShape);
    }
  }

  const dragEnd = (e) => {
    setIsDragging(false);
    onDragEnd(index, accIndex);
  }

  const renderBasedOnType = () => {
    switch (type) {
      case 'section':
        return <Section
          id={`${accIndex? accIndex+'-':''}${index}-${type}`}
          width={width}
          height={height}
          draggable
          hovered={hoverSide === 'middle'}
          ref={rectRef}
          x={0}
          y={DISTANCE_BETWEEN_ELEMENTS/2}
          opacity={isDragging?0.8:1}
          onClick={(e) => {console.log(e)}}
          onDragStart={() => {setIsDragging(true)}}
          onDragMove={onDrag}
          onDragEnd={dragEnd}
        >
          {children}
        </Section>
      default:
        return <Rect
          id={`${accIndex? accIndex+'-':''}${index}-formitem`}
          fill={fill}
          width={width}
          height={height}
          draggable
          ref={rectRef}
          x={0}
          y={DISTANCE_BETWEEN_ELEMENTS/2}
          opacity={isDragging?0.8:1}
          onClick={(e) => {console.log(e)}}
          onDragStart={() => {setIsDragging(true)}}
          onDragMove={onDrag}
          onDragEnd={dragEnd}
        />;
    }
  }

  return (
    <Group
      x={x}
      y={accIndex ? 0 : (y - (DISTANCE_BETWEEN_ELEMENTS/2)) }
      id={`${accIndex}-${index}-${type}`}
      width={width}
      height={accIndex ? height : (height + DISTANCE_BETWEEN_ELEMENTS) }
    >
      {/* Esse portal é para trazer o item para frente quando estiver no estado de drag */}
      <Portal id={`${accIndex}-${index}-${type}`} selector=".top-layer" enabled={isDragging}>
        {renderBasedOnType()}
      </Portal>
      {/* Hovers */}
      {renderHover()}
    </Group>
  );
};

export { FormItem };
