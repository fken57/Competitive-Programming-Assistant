import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export const NotFoundGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth || 1000;
    const height = svgRef.current.clientHeight || 500;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define "404" point grid coordinates
    const gridPoints: { x: number, y: number }[] = [
      // First '4' (offset x=0)
      {x:0,y:0},{x:0,y:1},{x:0,y:2},
      {x:4,y:0},{x:4,y:1},{x:4,y:2},{x:4,y:3},{x:4,y:4},
      {x:1,y:2},{x:2,y:2},{x:3,y:2},

      // '0' (offset x=7)
      {x:8,y:0},{x:9,y:0},{x:10,y:0},
      {x:7,y:1},{x:7,y:2},{x:7,y:3},
      {x:11,y:1},{x:11,y:2},{x:11,y:3},
      {x:8,y:4},{x:9,y:4},{x:10,y:4},

      // Second '4' (offset x=14)
      {x:14,y:0},{x:14,y:1},{x:14,y:2},
      {x:18,y:0},{x:18,y:1},{x:18,y:2},{x:18,y:3},{x:18,y:4},
      {x:15,y:2},{x:16,y:2},{x:17,y:2},
    ];

    // Scale and center points
    const scale = 30; // Distance between nodes
    const gridWidth = 18 * scale;
    const gridHeight = 4 * scale;
    const offsetX = (width - gridWidth) / 2;
    const offsetY = (height - gridHeight) / 2;

    const nodes = gridPoints.map((p, i) => ({
      id: i,
      targetX: p.x * scale + offsetX,
      targetY: p.y * scale + offsetY,
      x: width / 2 + (Math.random() - 0.5) * 100, // Start slightly scattered
      y: height / 2 + (Math.random() - 0.5) * 100
    }));

    // Create random links between nearby nodes in the same letter for a mesh look
    const links: { source: number, target: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = gridPoints[i].x - gridPoints[j].x;
        const dy = gridPoints[i].y - gridPoints[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 1.5) { // connect adjacent grid points
          links.push({ source: i, target: j });
        }
      }
    }

    // Force simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      // Pull nodes toward their specific target coordinates
      .force("x", d3.forceX<any>().x(d => d.targetX).strength(0.5))
      .force("y", d3.forceY<any>().y(d => d.targetY).strength(0.5))
      // Repel slightly so they don't overlap completely if dragged together
      .force("charge", d3.forceManyBody().strength(-50))
      // Links act as springs
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(scale).strength(0.8));

    // Draw links
    const link = svg.append("g")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(links)
      .enter().append("line");

    // Draw nodes
    const nodeGroup = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<SVGGElement, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    nodeGroup.append("circle")
      .attr("r", 10)
      .attr("fill", "#FF5252") // Playful red color
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer");

    // Tick
    const radius = 10;
    simulation.on("tick", () => {
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

    // Drag functions
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
  }, []);

  return (
    <svg 
      ref={svgRef} 
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};
