// ResizableChart.js
import React from 'react';
import { Rnd } from 'react-rnd';
import Plot from 'react-plotly.js';
import { Box, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const ResizableChart = ({ graph, onDelete }) => {
  return (
    <Rnd
      default={{
        x: 0,
        y: 0,
        width: 500,
        height: 400,
      }}
      minWidth={300}
      minHeight={200}
      bounds="parent"
      style={{ border: '1px solid #ddd', background: '#f7f7f7' }}
    >
      <Box position="relative" width="100%" height="100%">
        <IconButton
          aria-label="Delete graph"
          icon={<CloseIcon />}
          size="sm"
          position="absolute"
          top="2"
          right="2"
          zIndex="1"
          onClick={onDelete}
        />
        <Plot
          data={graph.data}
          layout={{ ...graph.layout, autosize: true, width: '100%', height: '100%' }}
          config={{ responsive: true }}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
    </Rnd>
  );
};

export default ResizableChart;
