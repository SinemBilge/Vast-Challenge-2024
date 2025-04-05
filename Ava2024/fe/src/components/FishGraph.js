import React, { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const FishGraph = ({ data }) => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedFish, setSelectedFish] = useState(null);
  const forceGraphRef = useRef();

  const fishTypes = ['Offidiaa/Piscis osseus', 'Sockfish/Pisces foetida', 'Helenaa/Pisces satis'];
  const fishColors = {
    'Offidiaa/Piscis osseus': 'red',
    'Sockfish/Pisces foetida': 'blue',
    'Helenaa/Pisces satis': 'green'
  };

  useEffect(() => {
    const generateGraphData = () => {
      const nodes = [];
      const links = [];


      fishTypes.forEach((fish, index) => {
        nodes.push({
          id: fish,
          group: 1,
          color: fishColors[fish],
          fx: index * 300 + 100, 
          fy: 100
        });
      });

      const filteredData = selectedMonth
        ? data.filter(d => new Date(d.date).getMonth() + 1 === selectedMonth)
        : data;

      const cargoNodes = {};
      const locationNodes = {};
      let cargoX = 100;

      filteredData.forEach(d => {
        if (!cargoNodes[d.report_id]) {
          cargoNodes[d.report_id] = {
            id: d.report_id,
            group: 2,
            fishType: d.fish_type_name,
            color: fishColors[d.fish_type_name],
            timestamp: d.date,
            fx: cargoX, 
            fy: 400 
          };
          cargoX += 40; 
          nodes.push(cargoNodes[d.report_id]);
        }

        if (!locationNodes[d.location_id]) {
          locationNodes[d.location_id] = {
            id: d.location_id,
            group: 3,
            fishType: d.fish_type_name,
            color: fishColors[d.fish_type_name], 
            fx: cargoX, 
            fy: 700 
          };
          nodes.push(locationNodes[d.location_id]);
        }


        links.push({
          source: d.fish_type_name,
          target: d.report_id
        });


        links.push({
          source: d.report_id,
          target: d.location_id
        });
      });

      setGraphData({ nodes, links });
    };

    generateGraphData();
  }, [data, selectedMonth]);

  const handleNodeClick = node => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();
    if (node.group === 1) { 
      newHighlightNodes.add(node.id); 
      graphData.links.forEach(link => {
        if (link.source.id === node.id) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(link.target.id);
   
          graphData.links.forEach(link2 => {
            if (link2.source.id === link.target.id) {
              newHighlightLinks.add(link2);
              newHighlightNodes.add(link2.target.id);
            }
          });
        }
      });
    }
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
    setSelectedFish(node.id);
  };

  const getNodeColor = node => highlightNodes.has(node.id) ? fishColors[selectedFish] : (node.group === 1 ? node.color : 'gray');

  const getLinkColor = link => highlightLinks.has(link) ? fishColors[selectedFish] : 'gray';

  return (
    <div>
      <div>
        <label>Select Month: </label>
        <select onChange={e => setSelectedMonth(parseInt(e.target.value))} value={selectedMonth || ''}>
          {[...Array(12).keys()].map(m => (
            <option key={m} value={m + 1}>
              {new Date(0, m).toLocaleString('en', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>
      <ForceGraph2D
        ref={forceGraphRef}
        graphData={graphData}
        nodeAutoColorBy="group"
        nodeCanvasObject={(node, ctx, globalScale) => {

          ctx.beginPath();
          ctx.arc(node.x, node.y, 10 / globalScale, 0, 2 * Math.PI, false);
          ctx.fillStyle = getNodeColor(node);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();


          const label = node.id;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = getNodeColor(node);
          ctx.textAlign = 'center';


          if (node.group === 1) {
            ctx.textBaseline = 'bottom';
            ctx.fillText(label, node.x, node.y - 10 / globalScale - 2);
          } else if (node.group === 2) {
            ctx.textBaseline = node.id.endsWith('0') ? 'bottom' : 'top';
            ctx.fillText(label, node.x, node.id.endsWith('0') ? node.y - 10 / globalScale - 2 : node.y + 10 / globalScale + 2);
          } else {
            ctx.textBaseline = 'top';
            ctx.fillText(label, node.x, node.y + 10 / globalScale + 2);
          }
        }}
        linkColor={getLinkColor}
        linkWidth={(link) => (highlightLinks.has(link) ? 2 : 1)} 
        onNodeClick={handleNodeClick}
        d3AlphaDecay={0.05}
        d3VelocityDecay={0.2}
      />
    </div>
  );
};

export default FishGraph;
