import { VisualGraphData } from './graphUtils';

export const MAX_GRAPH_VISUALIZATION_NODES = 100;

export function canVisualizeGraph(graphData: VisualGraphData | null): boolean {
  return graphData !== null && graphData.nodes.length <= MAX_GRAPH_VISUALIZATION_NODES;
}
