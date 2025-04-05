// Dashboard.js
import React from 'react';
import { Box, Heading, IconButton, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useGraphs } from './App'; // Ensure the path is correct
import { CloseIcon } from '@chakra-ui/icons';
import HeatmapComponent from './HeatmapComponent'; // Ensure the path is correct
import NetworkGraphComponent from './NetworkGraphComponent'; // Ensure the path is correct
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css'; // Import the necessary CSS

function Dashboard() {
  const { graphs, setGraphs, networkGraphs, setNetworkGraphs } = useGraphs();
  const navigate = useNavigate();

  const deleteGraph = (index) => {
    const updatedGraphs = graphs.filter((_, i) => i !== index);
    setGraphs(updatedGraphs);
  };

  const deleteNetworkGraph = (index) => {
    const updatedNetworkGraphs = networkGraphs.filter((_, i) => i !== index);
    setNetworkGraphs(updatedNetworkGraphs);
  };

  const updateShips = (index, newShips) => {
    const updatedGraphs = [...graphs];
    updatedGraphs[index] = { ...updatedGraphs[index], ships: newShips };
    setGraphs(updatedGraphs);
  };

  const getColor = (value, type) => {
    if (type === 'occurrence' || type === 'harbor') {
      if (value === 0) {
        return '#3f53c6';
      } else if (value > 0 && value <= 15) {
        const blueShade = 155 - Math.round((value / 15) * 55);
        return `rgb(${blueShade}, ${blueShade}, 255)`;
      } else if (value > 15 && value <= 30) {
        const red = Math.round(((value - 15) / 15) * 255);
        const green = 128 + Math.round(((30 - value) / 15) * 127);
        return `rgb(${red}, ${green}, 0)`;
      }
      return '#FF4500';
    } else if (type === 'dwell') {
      if (value === 0) {
        return '#3f53c6';
      } else if (value > 0 && value <= 50000) {  
        const blueShade = 155 - Math.round((value / 50000) * 55);
        return `rgb(${blueShade}, ${blueShade}, 255)`;
      } else if (value > 50000 && value <= 100000) {  
        const red = Math.round(((value - 50000) / 50000) * 255);
        const green = 128 + Math.round(((100000 - value) / 50000) * 127);
        return `rgb(${red}, ${green}, 0)`;
      } else if (value > 100000 && value <= 300000) {  
        const red = 255;
        const green = Math.round(((300000 - value) / 50000) * 127);
        return `rgb(${red}, ${green}, 0)`;
      }
      return '#FF4500';
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedGraphs = Array.from(graphs);
    const [moved] = reorderedGraphs.splice(result.source.index, 1);
    reorderedGraphs.splice(result.destination.index, 0, moved);
    setGraphs(reorderedGraphs);
  };

  return (
    <Box p={4}>
      <Box display="flex" alignItems="center" justifyContent="space-between" bg="lightblue" p={4} mb={4}>
        <Button 
          bg="#319795" 
          color="white" 
          onClick={() => navigate('/')} 
        >
          Back to Explore view
        </Button>
        <Heading as="h1" size="lg" color="darkblue" textAlign="center" flex="1">
          Dashboard
        </Heading>
        <Box width="148px" /> {}
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="graphs" direction="horizontal">
          {(provided) => (
            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4} {...provided.droppableProps} ref={provided.innerRef}>
              {graphs.map((graph, index) => (
                <Draggable key={index} draggableId={String(index)} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps}>
                      <ResizableBox
                        width={1200}
                        height={750}
                        minConstraints={[150, 150]}
                        maxConstraints={[3000, 3000]}
                        resizeHandles={['se']}
                        style={{
                          border: '1px solid lightgray',
                          borderRadius: 'md',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        <Box display="flex" flexDirection="column" height="100%">
                          <Box cursor="move" {...provided.dragHandleProps} bg="gray.300" p={2}>
                            Drag me
                          </Box>
                          <Box flex="1">
                            <HeatmapComponent
                              date={graph.date}
                              data={graph.data}
                              locations={graph.locations || []} 
                              ships={graph.ships || []} 
                              setShips={(newShips) => updateShips(index, newShips)}
                              getColor={(value) => getColor(value, graph.dataType)}
                            />
                          </Box>
                          <IconButton
                            aria-label="Delete graph"
                            icon={<CloseIcon />}
                            size="sm"
                            position="absolute"
                            top="2"
                            right="2"
                            onClick={() => deleteGraph(index)}
                          />
                        </Box>
                      </ResizableBox>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}

export default Dashboard;