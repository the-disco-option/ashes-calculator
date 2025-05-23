//import {min} from "d3-array";
import * as d3 from 'd3'

function targetDepth(d) {
  return d.target.depth
}

export function left(node) {
  return node.depth
}

export function right(node, n) {
  return n - 1 - node.height
}

export function justify(node, n) {
  return node.sourceLinks.length ? node.depth : n - 1
}

export function center(node) {
  return node.targetLinks.length
    ? node.depth
    : node.sourceLinks.length
      ? d3.min(node.sourceLinks, targetDepth) - 1
      : 0
}
