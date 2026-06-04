import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function GraphViewer({ persons, relationships }) {
  const svgRef = useRef();

  useEffect(() => {
    if (persons.length === 0 || !svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 9)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#6366f1');

    const nodes = persons.map((p) => ({ id: p.id, name: p.name, data: p }));
    const edges = relationships.map((r) => ({
      source: r.person_a_id,
      target: r.person_b_id,
      type: r.relation_type,
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id((d) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const link = svg
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2)
      .attr('class', (d) => `link link-${d.type}`);

    const node = svg
      .selectAll('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

    node
      .append('circle')
      .attr('r', 30)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2);

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .text((d) => d.name.substring(0, 8));

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [persons, relationships]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <svg ref={svgRef} className="w-full bg-white dark:bg-slate-900" style={{ minHeight: '600px' }} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        💡 Drag nodes to move, zoom to explore
      </p>
    </div>
  );
}

export default GraphViewer;
