import React from "react";
import { Rect, Group } from 'react-konva';
import { DISTANCE_BETWEEN_ELEMENTS } from "../../../utils/constants";

/**
 * Basicamente isso agrupa o item a uma colision box, se o item estiver dentro de uma estrutura de colunas, o item vai ficar exatamente em cima da colision box.
 *
 * A estrutura do id vai ser usada para identificar onde um novo item solto está sendo solto.
 *
 * Estrutura do id: index do array em que ele esta inserido - id do item de fato - tipo do item - id da coluna se for o caso
 *
 * Ou seja, ao splitar o index, se o array tive 4 posições, se trata de um item dentro de uma coluna
 */
const FormItem = ({id, index, x, y, width, height, fill, columnIndex, onClick}) => {
  return (
    <Group
      x={x}
      y={columnIndex ? 0 : (y - (DISTANCE_BETWEEN_ELEMENTS/2)) }
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
      <Rect
        id={`${index}-${id}-formitem${columnIndex !== undefined ? `-${columnIndex}` : ''}`}
        fill={fill}
        width={width}
        height={height}
        x={0}
        y={columnIndex ? 0 : (DISTANCE_BETWEEN_ELEMENTS/2)}
        onClick={(e) => {
            console.log(`${index}-${id}-formitem${columnIndex !== undefined ? `-${columnIndex}` : ''}`)
        }}
      />
    </Group>
  );
};

export { FormItem };
