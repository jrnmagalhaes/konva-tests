import React from "react";
import { DrawerContainer } from "../../atoms";
import { FlowItem } from "../../molecules";
import { Layer, Shape } from 'react-konva';
import {MAIN_RADIUS, LINK_RADIUS, LINK_DISTANCE} from '../../../utils/constants';
import { exitPointPosition, initialPointPosition } from "../../../utils/calculatePositions";

function generateShapes() {
  return [...Array(5)].map((_, i) => ({
    id: i.toString(),
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    isDragging: false,
    initial: i === 0,
    exitLinked: i !== 4,
    initialLinked: i !== 0,
    selected: false
  }));
}
function generateBeziers(stars) {
	let beziers = stars.map((star, i) => {
		if (i + 1 === stars.length) {
			return null;
		}
		return {
			id: i.toString(),
			start: {
				id: star.id,
				x: star.x + LINK_DISTANCE + LINK_RADIUS + MAIN_RADIUS,
				y: star.y,
			},
			end: {
				id: stars[i+1].id,
				x: stars[i+1].x - (LINK_RADIUS + LINK_DISTANCE + MAIN_RADIUS),
				y: stars[i+1].y
			}
		}
	})
	beziers.pop();
	return beziers;
}

const INITIAL_STATE = generateShapes();
const INITIAL_BEZIERS = generateBeziers(INITIAL_STATE)

const FlowDrawer = () => {
	const [stars, setStars] = React.useState(INITIAL_STATE);
	const [beziers, setBeziers] = React.useState(INITIAL_BEZIERS);

  const handleDragStart = (e) => {
    const id = e.target.id();
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: star.id === id,
        };
      })
    );
  };
  const handleDragEnd = (e) => {
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: false,
        };
      })
    );
  };
	const dragEvent = (attrs, initial) => {
		setBeziers(beziers.map(bezier => ({
			...bezier,
			start: bezier.start.id === attrs.id ? {
				id: attrs.id,
        ...exitPointPosition(attrs.x, attrs.y, MAIN_RADIUS, LINK_RADIUS, LINK_DISTANCE, initial)
			} : bezier.start,
			end: bezier.end.id === attrs.id ? {
				id: attrs.id,
        ...initialPointPosition(attrs.x, attrs.y, MAIN_RADIUS)
			} : bezier.end
		})))
	}
  const onClickFlowItem = (id) => {
    setStars(
      stars.map((star) => {
        return {
          ...star,
          selected: star.selected ? false : star.id === id,
        };
      })
    );
  }
  return (
    <DrawerContainer>
      <Layer>
				{beziers.map((bezier) => (
					<Shape
						sceneFunc={(ctx, shape) => {
							ctx.beginPath();
							ctx.moveTo(bezier.start.x, bezier.start.y);
							ctx.bezierCurveTo(
								bezier.start.x + 50,
								bezier.start.y,
								bezier.end.x - 50,
								bezier.end.y,
								bezier.end.x,
								bezier.end.y
							);
							ctx.fillStrokeShape(shape);
						}}
						stroke="#BCD6F9"
						strokeWidth={4}
						hitStrokeWidth={20}
						onClick={() => {console.log(bezier.id)}}
					/>
				))}
        {stars.map((star) => (
          <FlowItem
            key={star.id}
            id={star.id}
            x={star.x}
            y={star.y}
            color="#56CCF2"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
						onDragMove={dragEvent}
            initial={star.initial}
            exitLinked={star.exitLinked}
            initialLinked={star.initialLinked}
            onClick={onClickFlowItem}
            selected={star.selected}
          />
        ))}
      </Layer>
    </DrawerContainer>
  );
};


export { FlowDrawer };
