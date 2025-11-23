import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FlowchartSpec, ThemeColors, FlowchartNode, FlowchartEdge } from '../types';

interface VisualizerProps {
  data: FlowchartSpec | null;
  theme: ThemeColors;
  width: number;
  height: number;
}

const Visualizer: React.FC<VisualizerProps> = ({ data, theme, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    // Clone data to avoid mutating props directly during simulation
    const nodes: FlowchartNode[] = data.nodes.map(n => ({ ...n }));
    const edges: (FlowchartEdge & { source: string | FlowchartNode; target: string | FlowchartNode })[] = data.edges.map(e => ({
      ...e,
      source: e.from,
      target: e.to
    }));

    // Create container group for zooming
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom)
       .on("dblclick.zoom", null); // Disable double click zoom

    // Define markers (arrowheads)
    const defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28) // Offset to not overlap node
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", theme.edge_color);

    // Force Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(60).strength(0.7))
      // Add a vertical force based on 'order' or basic hierarchy if strictly directed
      .force("y", d3.forceY((d: any) => {
          return (d.order || 0) * 80;
      }).strength(0.3));

    // Draw Edges
    const link = g.append("g")
      .attr("stroke", theme.edge_color)
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke-width", (d) => (d.priority && d.priority < 2 ? 2.5 : 1.5))
      .attr("stroke-dasharray", (d) => d.style === 'dashed' ? "5,5" : d.style === 'dotted' ? "2,2" : "none")
      .attr("marker-end", "url(#arrowhead)");

    // Draw Nodes
    const node = g.append("g")
      .attr("stroke", theme.edge_color)
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(d3.drag<SVGGElement, FlowchartNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Render shapes based on type
    node.each(function(d) {
        const el = d3.select(this);
        let color = theme.step_fill;
        if (d.category === 'title') color = theme.title_fill;
        if (d.category === 'phase') color = theme.phase_fill;
        if (d.category === 'decision') color = theme.decision_fill;
        if (d.category === 'end' || d.category === 'output') color = theme.end_fill;

        if (d.shape === 'diamond') {
            el.append("polygon")
              .attr("points", "0,-30 40,0 0,30 -40,0")
              .attr("fill", color);
        } else if (d.shape === 'ellipse') {
            el.append("ellipse")
              .attr("rx", 50).attr("ry", 30)
              .attr("fill", color);
        } else if (d.shape === 'doubleoctagon') {
            el.append("path")
                .attr("d", "M-45,-20 L-20,-45 L20,-45 L45,-20 L45,20 L20,45 L-20,45 L-45,20 Z")
                .attr("fill", color)
                .attr("stroke-width", 3); // Double border simulated by thickness
        } else {
            // Default Box
            el.append("rect")
              .attr("width", 100).attr("height", 50)
              .attr("x", -50).attr("y", -25)
              .attr("rx", 8)
              .attr("fill", color);
        }
        
        // Text Label
        el.append("text")
          .text(d.label)
          .attr("dy", 4)
          .attr("text-anchor", "middle")
          .attr("fill", theme.font_color)
          .attr("font-size", "11px")
          .attr("font-family", "sans-serif")
          .attr("pointer-events", "none")
          .call(wrap, 90); // Helper to wrap text
    });

    // Tooltip interaction
    node.append("title").text(d => `${d.category}: ${d.label}`);

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

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

    function wrap(text: any, width: number) {
       // Basic text wrapping logic for D3
       text.each(function(this: SVGTextElement) {
         const text = d3.select(this);
         const words = text.text().split(/\s+/).reverse();
         let word;
         let line: string[] = [];
         let lineNumber = 0;
         const lineHeight = 1.1; // ems
         const y = text.attr("y") || 0;
         const dy = parseFloat(text.attr("dy"));
         let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
         
         while (word = words.pop()) {
           line.push(word);
           tspan.text(line.join(" "));
           if ((tspan.node()?.getComputedTextLength() || 0) > width) {
             line.pop();
             tspan.text(line.join(" "));
             line = [word];
             tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
           }
         }
       });
    }

    return () => {
      simulation.stop();
    };
  }, [data, theme, width, height]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 shadow-inner">
      <svg ref={svgRef} width={width} height={height} className="block cursor-move touch-none" />
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none select-none">
        Use mouse wheel to zoom • Drag to move
      </div>
    </div>
  );
};

export default Visualizer;