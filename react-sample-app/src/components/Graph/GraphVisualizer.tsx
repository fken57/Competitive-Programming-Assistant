import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './GraphVisualizer.css';

type GraphVisualizerProps = {
  adjacentList: number[][]; // Currently unweighted. If weighted is added later, type might need adjustment.
  isDataLoaded: boolean;
  errorMessage: string;
  graphType: string; // 'directed' or 'undirected'
};

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ 
  adjacentList, 
  isDataLoaded, 
  errorMessage,
  graphType 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // If not loaded or error, don't draw. Clear previous drawing if any.
    if (!isDataLoaded || errorMessage) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
      return;
    }

    if (!svgRef.current || adjacentList.length === 0) return;

    // --- Prepare Nodes and Links for D3 ---
    const nodes = Array.from({ length: adjacentList.length }, (_, i) => ({ id: i }));
    const links: { source: number, target: number }[] = [];

    // To prevent duplicate undirected edges in rendering, we use a set
    const seenEdges = new Set<string>();

    adjacentList.forEach((neighbors, u) => {
      neighbors.forEach((v) => {
        // If it's an object with `to`, extract it (for future weighted support)
        const target = typeof v === 'number' ? v : (v as any).to;
        
        if (graphType === 'undirected') {
          const edgeId = [u, target].sort().join('-');
          if (!seenEdges.has(edgeId)) {
            seenEdges.add(edgeId);
            links.push({ source: u, target });
          }
        } else {
          links.push({ source: u, target });
        }
      });
    });

    // --- D3 Setup ---
    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 500;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    // Add arrow markers for directed graphs
    if (graphType === 'directed') {
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 20) // Adjust based on node radius
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#999")
        .style("stroke", "none");
    }

    // --- Force Simulation ---
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // --- Draw Links ---
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("class", "graph-link")
      .attr("marker-end", graphType === 'directed' ? "url(#arrowhead)" : "");

    // --- Draw Nodes ---
    const nodeGroup = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    nodeGroup.append("circle")
      .attr("r", 15)
      .attr("class", "graph-node");

    nodeGroup.append("text")
      .text((d) => (d.id + 1).toString()) // Display as 1-indexed
      .attr("class", "graph-node-label")
      .attr("dy", 4)
      .attr("text-anchor", "middle");

    // --- Tick Function ---
    const radius = 15;
    simulation.on("tick", () => {
      // Bound nodes to SVG dimensions
      nodes.forEach((d: any) => {
        d.x = Math.max(radius, Math.min(width - radius, d.x));
        d.y = Math.max(radius, Math.min(height - radius, d.y));
      });

      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodeGroup
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // --- Drag Functions ---
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [adjacentList, isDataLoaded, errorMessage, graphType]);

  return (
    <div className="graph-visualizer-container">
      {errorMessage ? (
        <div className="graph-message error">
          <h3>入力エラー</h3>
          <p>{errorMessage}</p>
        </div>
      ) : !isDataLoaded ? (
        <div className="graph-message info">
          <h3>D3.js Graph Visualizer</h3>
          <p>左側のフォームからグラフデータを入力して送信してください。</p>
        </div>
      ) : null}
      
      {/* SVG is always present to measure its dimensions, but might be empty if not loaded */}
      <svg 
        ref={svgRef} 
        className="graph-svg" 
        style={{ opacity: isDataLoaded && !errorMessage ? 1 : 0 }}
      />
    </div>
  );
};
