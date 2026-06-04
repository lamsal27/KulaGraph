import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import api from '../services/api';

function TreeViewer({ persons, relationships, treeId, onDeletePerson }) {
  const svgRef = useRef();
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);

  useEffect(() => {
    if (persons.length === 0 || !svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions
    const width = svgRef.current.clientWidth;
    const height = 600;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'graph');

    // Create arrow marker for links
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
      .attr('fill', '#9ca3af');

    // Build graph data
    const nodes = persons.map((p) => ({ id: p.id, name: p.name, data: p }));
    const edges = relationships.map((r) => ({
      source: r.person_a,
      target: r.person_b,
      type: r.type,
    }));

    // Create simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(edges)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const link = svg
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', (d) => `link ${d.type}`)
      .attr('stroke-width', 2);

    // Create nodes
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
      .attr('r', 25)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedPerson(d.data);
      })
      .on('mouseover', function () {
        d3.select(this).transition().attr('r', 30);
      })
      .on('mouseout', function () {
        d3.select(this).transition().attr('r', 25);
      });

    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d) => d.name.substring(0, 3));

    // Update positions on simulation tick
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

  const handleAddRelationship = async (type, targetPersonId) => {
    try {
      await api.post('/api/relationships', {
        person_a: selectedPerson.id,
        person_b: targetPersonId,
        type,
      });
      setShowRelationshipForm(false);
      window.location.reload();
    } catch (error) {
      console.error('Error adding relationship:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="graph-container">
        <svg ref={svgRef} />
      </div>

      {selectedPerson && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedPerson.name}</h3>
              {selectedPerson.dob && (
                <p className="text-sm text-gray-600 mt-1">📅 DOB: {selectedPerson.dob}</p>
              )}
              {selectedPerson.notes && (
                <p className="text-sm text-gray-600 mt-2">{selectedPerson.notes}</p>
              )}
              {selectedPerson.contact && (
                <p className="text-sm text-gray-600 mt-1">📞 {selectedPerson.contact}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRelationshipForm(true)}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                + Relation
              </button>
              <button
                onClick={() => {
                  onDeletePerson(selectedPerson.id);
                  setSelectedPerson(null);
                }}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedPerson(null)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
              >
                ✕
              </button>
            </div>
          </div>

          {showRelationshipForm && (
            <div className="mt-4 p-3 bg-white rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Select relation type:</p>
              <div className="grid grid-cols-2 gap-2">
                {['parent', 'child', 'spouse', 'sibling'].map((type) => (
                  <button
                    key={type}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                    onClick={() => {
                      // Show person selector
                      const targetPerson = persons.find(
                        (p) => p.id !== selectedPerson.id
                      );
                      if (targetPerson) {
                        handleAddRelationship(type, targetPerson.id);
                      }
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>💡 Tip: Click on nodes to select, drag to move, hover for details</p>
      </div>
    </div>
  );
}

export default TreeViewer;
