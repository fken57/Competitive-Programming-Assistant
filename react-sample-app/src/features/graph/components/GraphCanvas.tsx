import { useEffect, useRef } from 'react';

export type CanvasNode = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type CanvasEdge = {
  from: number;
  to: number;
};

type GraphCanvasProps = {
  vertexCount: number;
  edges: CanvasEdge[];
  isDirected: boolean;
  highlightedNodes?: Set<number>;
  highlightedEdges?: Set<string>;
  nodeColors?: Map<number, string>;
  bfsOrder?: number[];
  onClickNode?: (nodeId: number) => void;
};

export default function GraphCanvas({
  vertexCount,
  edges,
  isDirected,
  highlightedNodes = new Set(),
  highlightedEdges = new Set(),
  nodeColors = new Map(),
  bfsOrder = [],
  onClickNode,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<CanvasNode[]>([]);
  const isDraggingRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  // Initialize node positions in a circle when vertexCount changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const newNodes: CanvasNode[] = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i * 2 * Math.PI) / Math.max(1, vertexCount);
      newNodes.push({
        id: i,
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 10,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 10,
        vx: 0,
        vy: 0,
      });
    }

    nodesRef.current = newNodes;
  }, [vertexCount]);

  // Spring Physics & Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();

    const loop = () => {
      const nodes = nodesRef.current;
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Force variables
      const kRepulsion = 1500;
      const kSpring = 0.06;
      const restLength = 90;
      const damping = 0.82;

      // 1. Repulsion forces (between all nodes)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const force = kRepulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (isDraggingRef.current !== n1.id) {
            n1.vx -= fx;
            n1.vy -= fy;
          }
          if (isDraggingRef.current !== n2.id) {
            n2.vx += fx;
            n2.vy += fy;
          }
        }
      }

      // 2. Spring forces (along parsed edges)
      for (const edge of edges) {
        const u = nodes.find((n) => n.id === edge.from);
        const v = nodes.find((n) => n.id === edge.to);
        if (!u || !v) continue;

        const dx = v.x - u.x;
        const dy = v.y - u.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const displacement = dist - restLength;
        const force = kSpring * displacement;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (isDraggingRef.current !== u.id) {
          u.vx += fx;
          u.vy += fy;
        }
        if (isDraggingRef.current !== v.id) {
          v.vx -= fx;
          v.vy -= fy;
        }
      }

      // 3. Gravity towards center
      const centerX = width / 2;
      const centerY = height / 2;
      for (const node of nodes) {
        if (isDraggingRef.current === node.id) continue;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.005;
        node.vy += dy * 0.005;
      }

      // 4. Update coordinates and boundary collisions
      const padding = 24;
      for (const node of nodes) {
        if (isDraggingRef.current === node.id) continue;

        node.vx *= damping;
        node.vy *= damping;

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < padding) { node.x = padding; node.vx = 0; }
        if (node.x > width - padding) { node.x = width - padding; node.vx = 0; }
        if (node.y < padding) { node.y = padding; node.vy = 0; }
        if (node.y > height - padding) { node.y = height - padding; node.vy = 0; }
      }

      // 5. Draw Canvas elements
      ctx.clearRect(0, 0, width, height);

      // --- DRAW EDGES ---
      for (const edge of edges) {
        const u = nodes.find((n) => n.id === edge.from);
        const v = nodes.find((n) => n.id === edge.to);
        if (!u || !v) continue;

        const isHighlighted =
          highlightedEdges.has(`${edge.from}-${edge.to}`) ||
          (!isDirected && highlightedEdges.has(`${edge.to}-${edge.from}`));

        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);

        if (isHighlighted) {
          ctx.strokeStyle = '#fbbf24'; // Amber Gold
          ctx.lineWidth = 3.5;
          ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
          ctx.shadowBlur = 10;
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
          ctx.lineWidth = 2;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw arrow if directed
        if (isDirected) {
          drawArrow(ctx, u.x, u.y, v.x, v.y, 18);
        }
      }

      // --- DRAW NODES ---
      const nodeRadius = 18;
      for (const node of nodes) {
        const isHighlighted = highlightedNodes.has(node.id);
        const customColor = nodeColors.get(node.id);

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);

        ctx.fillStyle = 'rgba(9, 13, 26, 0.9)';
        ctx.fill();

        ctx.lineWidth = 3;
        if (isHighlighted) {
          ctx.strokeStyle = '#fbbf24'; // Gold highlight
          ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
          ctx.shadowBlur = 12;
        } else if (customColor) {
          ctx.strokeStyle = customColor;
          ctx.shadowColor = customColor;
          ctx.shadowBlur = 6;
        } else {
          ctx.strokeStyle = '#2dd4bf'; // Teal primary
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw node ID text
        ctx.fillStyle = isHighlighted ? '#fbbf24' : '#f8fafc';
        ctx.font = 'bold 0.95rem Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id.toString(), node.x, node.y);

        // BFS Visit Indices overlay
        const bfsIndex = bfsOrder.indexOf(node.id);
        if (bfsIndex !== -1) {
          ctx.save();
          ctx.fillStyle = 'rgba(45, 212, 191, 0.9)';
          ctx.beginPath();
          ctx.arc(node.x + 14, node.y - 14, 8, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#040815';
          ctx.font = 'bold 0.65rem JetBrains Mono';
          ctx.fillText((bfsIndex + 1).toString(), node.x + 14, node.y - 14);
          ctx.restore();
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [edges, isDirected, highlightedNodes, highlightedEdges, nodeColors, bfsOrder]);

  // Directed arrow visual helper
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    nodeRadius: number
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const arrowLength = 10;
    const arrowWidth = 6;

    const targetX = toX - nodeRadius * Math.cos(angle);
    const targetY = toY - nodeRadius * Math.sin(angle);

    ctx.save();
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.beginPath();
    ctx.moveTo(targetX, targetY);
    ctx.lineTo(
      targetX - arrowLength * Math.cos(angle - Math.PI / arrowWidth),
      targetY - arrowLength * Math.sin(angle - Math.PI / arrowWidth)
    );
    ctx.lineTo(
      targetX - arrowLength * Math.cos(angle + Math.PI / arrowWidth),
      targetY - arrowLength * Math.sin(angle + Math.PI / arrowWidth)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodesRef.current.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 22;
    });

    if (clickedNode) {
      isDraggingRef.current = clickedNode.id;
      if (onClickNode) onClickNode(clickedNode.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const draggedNode = nodesRef.current.find((n) => n.id === isDraggingRef.current);
    if (draggedNode) {
      draggedNode.x = x;
      draggedNode.y = y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
    }
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = null;
  };

  return (
    <div className="visualizer-area">
      <canvas
        ref={canvasRef}
        className="visualizer-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      />
      <div className="visualizer-instructions">
        <span>🖱️ ノードをドラッグしてレイアウトを変更</span>
        <span>👉 ノードをクリックして、BFSの開始頂点を選択</span>
      </div>
    </div>
  );
}
