import { VisualEdge, VisualNode } from './graphUtils';

export type GraphLayoutMode = 'force' | 'tree' | 'linear';

export type PositionedVisualNode = VisualNode & {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

export type PositionedVisualEdge = Omit<VisualEdge, 'source' | 'target'> & {
  source: number | PositionedVisualNode;
  target: number | PositionedVisualNode;
};

export const resolveStaticGraphLinks = (
  nodes: PositionedVisualNode[],
  links: PositionedVisualEdge[]
) => {
  const nodeById = new Map(nodes.map(node => [node.id, node]));
  links.forEach(link => {
    if (typeof link.source === 'number') {
      link.source = nodeById.get(link.source) ?? link.source;
    }
    if (typeof link.target === 'number') {
      link.target = nodeById.get(link.target) ?? link.target;
    }
  });
};

const positionNode = (node: PositionedVisualNode, x: number, y: number) => {
  node.x = x;
  node.y = y;
  node.fx = x;
  node.fy = y;
};

export const applyStaticGraphLayout = (
  nodes: PositionedVisualNode[],
  width: number,
  height: number,
  mode: Exclude<GraphLayoutMode, 'force'>
) => {
  const horizontalMargin = Math.min(60, width / 4);
  const verticalMargin = Math.min(50, height / 4);

  if (mode === 'linear') {
    const orderedNodes = [...nodes].sort((left, right) => {
      const leftOrder = left.attributes?.orderIndex ?? left.id;
      const rightOrder = right.attributes?.orderIndex ?? right.id;
      return leftOrder - rightOrder;
    });
    const gap = orderedNodes.length > 1
      ? (width - horizontalMargin * 2) / (orderedNodes.length - 1)
      : 0;
    orderedNodes.forEach((node, index) => {
      positionNode(node, orderedNodes.length === 1 ? width / 2 : horizontalMargin + gap * index, height / 2);
    });
    return;
  }

  const levels = new Map<number, PositionedVisualNode[]>();
  nodes.forEach(node => {
    const depth = Number.isFinite(node.attributes?.depth) ? node.attributes?.depth : 0;
    const level = levels.get(depth) ?? [];
    level.push(node);
    levels.set(depth, level);
  });

  const sortedLevels = Array.from(levels.entries()).sort(([leftDepth], [rightDepth]) => leftDepth - rightDepth);
  const verticalGap = sortedLevels.length > 1
    ? (height - verticalMargin * 2) / (sortedLevels.length - 1)
    : 0;

  sortedLevels.forEach(([, levelNodes], levelIndex) => {
    levelNodes.sort((left, right) => {
      const leftOrder = left.attributes?.orderInLevel ?? left.id;
      const rightOrder = right.attributes?.orderInLevel ?? right.id;
      return leftOrder - rightOrder;
    });
    const horizontalGap = levelNodes.length > 1
      ? (width - horizontalMargin * 2) / (levelNodes.length - 1)
      : 0;
    levelNodes.forEach((node, index) => {
      const x = levelNodes.length === 1 ? width / 2 : horizontalMargin + horizontalGap * index;
      const y = sortedLevels.length === 1 ? height / 2 : verticalMargin + verticalGap * levelIndex;
      positionNode(node, x, y);
    });
  });
};
