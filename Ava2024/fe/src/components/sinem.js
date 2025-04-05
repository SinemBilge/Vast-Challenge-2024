// src/components/Visualization.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Visualization = () => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current)
      .attr('width', 800)
      .attr('height', 600)
      .style('border', '1px solid black');

    // Sample data
    const data = [
      { id: 1, type: 'Cargo', name: 'Cargo1' },
      { id: 2, type: 'Vessel', name: 'Vessel1' },
      { id: 3, type: 'Location', name: 'Location1' },
      { id: 4, type: 'Quantity', name: '1000 tons' }
    ];

    const links = [
      { source: 1, target: 2 },
      { source: 2, target: 3 },
      { source: 3, target: 4 }
    ];

    const simulation = d3.forceSimulation(data)
      .force('link', d3.forceLink(links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(400, 300));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .selectAll('circle')
      .data(data)
      .enter().append('circle')
      .attr('r', 10)
      .attr('fill', d => {
        if (d.type === 'Cargo') return 'blue';
        if (d.type === 'Vessel') return 'green';
        if (d.type === 'Location') return 'red';
        return 'orange';
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    const text = svg.append('g')
      .selectAll('text')
      .data(data)
      .enter().append('text')
      .attr('x', 15)
      .attr('y', 3)
      .text(d => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      text
        .attr('x', d => d.x + 15)
        .attr('y', d => d.y + 3);
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, []);

  return <svg ref={ref}></svg>;
};

export default Visualization;
