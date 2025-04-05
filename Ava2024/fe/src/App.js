import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Split from 'react-split';
import FishGraph from './components/FishGraph';
import {
  Box,
  Button,
  Heading,
  Flex,
} from '@chakra-ui/react';
import Heatmap from './Heatmap';
import TrendLineChart from './LineChart';
import CargoVessels from './components/CargoVessels';
import Dashboard from './Dashboard';
import TrendGraph from './TrendGraph';
import './App.css';

const GraphContext = createContext();

const GraphProvider = ({ children }) => {
  const [graphs, setGraphs] = useState(() => {
    const savedGraphs = localStorage.getItem('graphs');
    return savedGraphs ? JSON.parse(savedGraphs) : [];
  });

  const [networkGraphs, setNetworkGraphs] = useState(() => {
    const savedNetworkGraphs = localStorage.getItem('networkGraphs');
    return savedNetworkGraphs ? JSON.parse(savedNetworkGraphs) : [];
  });

  useEffect(() => {
    localStorage.setItem('graphs', JSON.stringify(graphs));
  }, [graphs]);

  useEffect(() => {
    localStorage.setItem('networkGraphs', JSON.stringify(networkGraphs));
  }, [networkGraphs]);

  return (
    <GraphContext.Provider value={{ graphs, setGraphs, networkGraphs, setNetworkGraphs }}>
      {children}
    </GraphContext.Provider>
  );
};

const useGraphs = () => useContext(GraphContext);

function ExploreView() {
  const navigate = useNavigate();
  const { graphs, setGraphs, networkGraphs, setNetworkGraphs } = useGraphs();
  const [selectedMonth, setSelectedMonth] = useState('02'); 
  const [resizeCounter, setResizeCounter] = useState(0); 
  const [showComponent, setShowComponent] = useState('CargoVessels'); 
  const [currentNetworkGraph, setCurrentNetworkGraph] = useState(null); 
  const [combinedData, setCombinedData] = useState(null); 

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  const addToDashboard = (heatmapData) => {
    setGraphs([...graphs, heatmapData]);
  };

  const addNetworkGraphToDashboard = () => {
    if (currentNetworkGraph) {
      setNetworkGraphs([...networkGraphs, currentNetworkGraph]);
    }
  };

  const handleShowCargoVessels = () => {
    setShowComponent('CargoVessels');
  };

  const handleShowSuspicious = () => {
    setShowComponent('Suspicious');
  };

  useEffect(() => {
    const sampleNetworkGraphData = { nodes: [], links: [] }; 
    setCurrentNetworkGraph({ data: sampleNetworkGraphData });

    fetch('http://localhost:8000/main/combined/')
      .then(response => response.json())
      .then(data => setCombinedData(data))
      .catch(error => console.error('Error fetching combined data:', error));
  }, [showComponent]);

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Flex justify="space-between" align="center" p={4} bg="lightblue">
        <Heading as="h1" size="lg" color="darkblue" fontStyle="italic">Vast Challenge 2024 MC2</Heading>
        <Heading as="h1" size="lg" color="darkblue">Exploration View</Heading>
        <Button colorScheme="teal" onClick={navigateToDashboard}>Switch to Dashboard</Button>
      </Flex>
      <Split
        sizes={[50, 50]}
        minSize={50}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        className="split"
        onDrag={() => setResizeCounter(resizeCounter + 1)}
      >
        <Box p={4} bg="gray.100" display="flex" flexDirection="column" flex="1">
          <Box flex="1" width="100%">
            <Heatmap selectedMonth={selectedMonth} handleMonthSelect={handleMonthSelect} addToDashboard={addToDashboard} />
          </Box>
          <Box flex="1" width="100%" mt={4}>
            <TrendLineChart selectedMonth={selectedMonth} key={resizeCounter} />
          </Box>
          <Box flex="1" width="100%" mt={4}>
            <TrendGraph />
          </Box>
        </Box>
        <Box p={4} bg="gray.200" display="flex" flexDirection="column">
          <Flex className="right-side-buttons">
            <Button colorScheme="green" onClick={handleShowCargoVessels} mr={4}>Cargo Vessels</Button>
            <Button colorScheme="red" onClick={handleShowSuspicious}>Suspicious</Button>
          </Flex>
          <Box className="right-side-container">
            <Box className="graph-container">
              {showComponent === 'CargoVessels' ? 
                <CargoVessels date="2035-02-01" /> : 
                <FishGraph data={combinedData} date="2035-02-01" />
              }
            </Box>
          </Box>
        </Box>
      </Split>
    </Box>
  );
}

function App() {
  return (
    <GraphProvider>
      <Router>
        <div>
          <Routes>
            <Route exact path="/" element={<ExploreView />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </GraphProvider>
  );
}

export { useGraphs };
export default App;