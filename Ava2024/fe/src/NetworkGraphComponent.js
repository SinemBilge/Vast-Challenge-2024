import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraphComponent = ({ data }) => {
  const graphData = data || { nodes: [], links: [] };

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeAutoColorBy="group"
      linkDirectionalParticles="value"
      linkDirectionalParticleSpeed={d => d.value * 0.001}
      nodeLabel="id"
    />
  );
};

export default NetworkGraphComponent;
