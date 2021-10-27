function initialPointPosition (x, y, main_radius, relative = false) {
	return {
		x: relative ? 0 : x,
		y: relative ? main_radius : y+main_radius
	}
}

function exitPointPosition (x, y, main_radius, point_radius, link_distance, isInitial, relative = false) {
	if (relative) {
		return {
			x: ((2*main_radius) + point_radius + (isInitial? ((2*link_distance)+(2*point_radius)) : (link_distance))),
			y: main_radius
		}
	}
	return {
		x: (x + ((2*main_radius) + point_radius + (!isInitial? ((2*link_distance)+(2*point_radius)) : (link_distance)))),
		y: y+main_radius
	}
}

export {
	initialPointPosition,
	exitPointPosition
}