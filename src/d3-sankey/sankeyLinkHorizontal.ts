//import {linkHorizontal} from "d3-shape";
import * as d3 from 'd3'

function horizontalSource(d) {
  return [d.source.x1, d.y0]
}

function horizontalTarget(d) {
  return [d.target.x0, d.y1]
}

export default function () {
  return d3.linkHorizontal().source(horizontalSource).target(horizontalTarget)
}
