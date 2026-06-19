import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { VisualGraphData, VisualNode, VisualEdge } from '../../util/graphUtils';
import './GraphVisualizer.css';

type GraphVisualizerProps = {
  graphData: VisualGraphData | null;
  isDataLoaded: boolean;
  errorMessage: string;
  graphType: string; // 'directed' or 'undirected'
  nodeColorFn?: (node: VisualNode) => string;
  edgeColorFn?: (edge: VisualEdge) => string;
};

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ 
  graphData, 
  isDataLoaded, 
  errorMessage,
  graphType,
  nodeColorFn,
  edgeColorFn
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // If not loaded or error, don't draw. Clear previous drawing if any.
    if (!isDataLoaded || errorMessage || !graphData) {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
      return;
    }

    if (!svgRef.current || graphData.nodes.length === 0) return;

    // Deep copy nodes and edges for D3 simulation to mutate without affecting React state
    const nodes = graphData.nodes.map(n => ({ ...n }));
    const links = graphData.edges.map(e => ({ ...e }));

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
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.05)) // Pull isolated nodes to center horizontally
      .force("y", d3.forceY(height / 2).strength(0.05)); // Pull isolated nodes to center vertically

    // --- Draw Links ---
    const linkGroup = svg.append("g")
      .attr("class", "links")
      .selectAll("g")
      .data(links)
      .enter().append("g");

    const link = linkGroup.append("line")
      .attr("class", "graph-link")
      .attr("stroke", (d: any) => edgeColorFn ? edgeColorFn(d) : (d.color || '#999'))
      .attr("stroke-width", (d: any) => d.isStartEdge ? 4 : 2)
      .attr("marker-end", graphType === 'directed' ? "url(#arrowhead)" : "");

    const linkLabel = linkGroup.append("text")
      .text((d: any) => d.weight !== undefined ? d.weight.toString() : "")
      .attr("class", "graph-edge-label")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .style("fill", "#555")
      .style("font-size", "12px");

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
      .attr("class", "graph-node")
      .style("fill", (d: any) => nodeColorFn ? nodeColorFn(d) : (d.color || '#fff'))
      .attr("stroke", (d: any) => d.isStartNode ? '#333' : '#666')
      .attr("stroke-width", (d: any) => d.isStartNode ? 4 : 2);

    nodeGroup.append("text")
      .text((d: any) => d.label)
      .attr("class", "graph-node-label")
      .attr("dy", 4)
      .attr("text-anchor", "middle")
      .style("fill", "#333");

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

      linkLabel
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

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
  }, [graphData, isDataLoaded, errorMessage, graphType, nodeColorFn, edgeColorFn]);

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
