// src/components/HierarchicalMap.js
import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const HierarchicalMap = ({ data }) => {
  const graphData = useMemo(() => {
    const generateGraphData = () => {
      const nodes = [];
      const links = [];


      const locationMap = {};
      const vesselMap = {};

      data.forEach(d => {
        if (!locationMap[d.location_id]) {
          locationMap[d.location_id] = { id: d.location_id, group: 1 };
          nodes.push(locationMap[d.location_id]);
        }

        if (!vesselMap[d.vessel_name]) {
          vesselMap[d.vessel_name] = { id: d.vessel_name, group: 2 };
          nodes.push(vesselMap[d.vessel_name]);
          links.push({ source: d.location_id, target: d.vessel_name });
        }

        const cargoNode = { id: d.delivery_report_id, group: 3 };
        nodes.push(cargoNode);
        links.push({ source: d.vessel_name, target: cargoNode.id });
      });

      return { nodes, links };
    };

    return generateGraphData();
  }, [data]);

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeAutoColorBy="group"
      nodeCanvasObject={(node, ctx, globalScale) => {

        ctx.beginPath();
        ctx.arc(node.x, node.y, 10 / globalScale, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.group === 1 ? 'red' : node.group === 2 ? 'blue' : 'green';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

     
        const label = node.id;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = node.group === 1 ? 'red' : node.group === 2 ? 'blue' : 'green';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top'; 
        ctx.fillText(label, node.x, node.y + 10 / globalScale + 2); 
      }}
      linkColor={() => 'grey'}
      onNodeDragEnd={node => {
        node.fx = node.x;
        node.fy = node.y;
      }}
      d3AlphaDecay={0.05}
      d3VelocityDecay={0.2}
    />
  );
};

export default HierarchicalMap;
