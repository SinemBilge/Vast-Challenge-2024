// Heatmap.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text
} from '@chakra-ui/react';
import { format, addMonths, isValid } from 'date-fns';
import { useGraphs } from './App'; 
import './Heatmap.css';

const prioritizeShips = (ships = []) => {
  const priorityShips = ['Roach Robber', 'Snapper Snatcher'];
  return [
    ...priorityShips.filter(ship => ships.includes(ship)),
    ...ships.filter(ship => !priorityShips.includes(ship)),
  ];
};

const cleanLocationName = (location) => {
  return location.replace(/^City of\s+/, '');
};

const HeatmapComponent = ({ date, data, locations = [], ships = [], setShips = () => {}, getColor = () => {} }) => {
  console.log("HeatmapComponent received date:", date); 

  if (!date || !isValid(new Date(date))) {
    console.error("Invalid date format:", date);
    return <div>Error: Invalid date format</div>;
  }

  const prioritizedShips = prioritizeShips(ships);
  const heatmapData = prioritizedShips.map(ship =>
    locations.map(location => (data[date] && data[date][ship] ? data[date][ship][location] || 0 : 0))
  );

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newShips = Array.from(prioritizedShips);
    const [removed] = newShips.splice(result.source.index, 1);
    newShips.splice(result.destination.index, 0, removed);
    setShips(newShips);
  };

  return (
    <div className="heatmap-container" style={{ width: '100%' }}>
      <div className="grid-box" style={{ gridTemplateColumns: `220px repeat(${locations.length}, 1fr)` }}>
        <div className="heatmap-header">
          <div></div>
          {locations.map((location, index) => (
            <div key={index} title={(location)}>
              {(location)}
            </div>
          ))}
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="ships">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {prioritizedShips.map((ship, index) => (
                  <Draggable key={ship} draggableId={ship} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div className="draggable-row">
                          <span title={ship}>{ship}</span>
                          {heatmapData[index].map((value, idx) => (
                            <div
                              key={idx}
                              className="heatmap-cell"
                              style={{
                                background: getColor(value),
                                color: 'black'
                              }}
                            >
                              {value}
                              <div className="tooltip">
                                {`Value: ${value}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

const Heatmap = ({ selectedMonth, handleMonthSelect }) => {
  const { setGraphs } = useGraphs(); 
  const [sliderValue, setSliderValue] = useState(0);
  const [selectedButton, setSelectedButton] = useState('Fishing Vessels');
  const [selectedVessels, setSelectedVessels] = useState([]);
  const [data, setData] = useState({});
  const [dates, setDates] = useState([]);
  const [date, setDate] = useState('2035-02-01'); 
  const [ships, setShips] = useState([]);
  const [dataType, setDataType] = useState('occurrence');
  const [selectedLocationTypes, setSelectedLocationTypes] = useState(['City']);

  const locationTypes = {
    City: [
      'Haacklee', 'Himark', 'Lomark', 'Paackland',
      'Port Grove', 'South Paackland'
    ],
    Buoy: [
      'Exit East', 'Exit North', 'Exit South', 'Exit West', 'Nav 1', 'Nav 2', 'Nav 3',
      'Nav A', 'Nav B', 'Nav C', 'Nav D', 'Nav E'
    ],
    'Ecological Preserve': [
      'Don Limpet Preserve', 'Ghoti Preserve', 'Nemo Reef'
    ],
    'Fishing Ground': [
      'Cod Table', 'Tuna Shelf', 'Wrasse Beds'
    ]
  };

  const vesselTypeMapping = {
    "Ferry Passenger Vessel": "Entity.Vessel.Ferry.Passenger",
    "Cargo Vessel": "Entity.Vessel.CargoVessel",
    "Research Vessel": "Entity.Vessel.Research",
    "Tour Vessel": "Entity.Vessel.Tour",
    "Other Vessel": "Entity.Vessel.Other",
    "Ferry Cargo Vessel": "Entity.Vessel.Ferry.Cargo"
  };

  useEffect(() => {
    if (dates.length > 0) {
      setDate(dates[sliderValue]);
    }
  }, [sliderValue, dates]);

  useEffect(() => {
    setShips(date && data[date] ? Object.keys(data[date]) : []);
  }, [date, data]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!/^(0[1-9]|1[0-2])$/.test(selectedMonth)) {
          throw new Error(`Invalid month format: ${selectedMonth}`);
        }
    
        const startDate = new Date(`2035-${selectedMonth}-01`);
        const endDate = addMonths(startDate, 1);
    
        if (!isValid(startDate) || !isValid(endDate)) {
          throw new Error(`Invalid date computed: startDate = ${startDate}, endDate = ${endDate}`);
        }
    
        const formattedStartDate = format(startDate, 'yyyy-MM-dd');
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
    
        let url = `http://localhost:8000/main/transponder-pings/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
        if (dataType === 'harbor') {
          url = `http://localhost:8000/main/harbor-reports/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`;
        }
    
        const response = await axios.get(url);
        const fetchedData = response.data;
    
        const filteredData = fetchedData.filter(item => {
          if (selectedButton === 'Fishing Vessels') {
            return item.vessel_type === 'Entity.Vessel.FishingVessel';
          } else {
            if (selectedVessels.length > 0) {
              return selectedVessels.some(vessel => vesselTypeMapping[vessel] === item.vessel_type);
            }
            return item.vessel_type !== 'Entity.Vessel.FishingVessel';
          }
        });
    
        const formattedData = filteredData.reduce((acc, item) => {
          const { vessel_name, location_name, count, dwellSum, vessel_count } = item;
          const value = dataType === 'occurrence' ? count : dataType === 'dwell' ? Math.floor(dwellSum) : vessel_count;
          const dateKey = format(startDate, 'yyyy-MM-dd');
          if (!acc[dateKey]) {
            acc[dateKey] = {};
          }
          if (!acc[dateKey][vessel_name]) {
            acc[dateKey][vessel_name] = {};
          }
          acc[dateKey][vessel_name][location_name] = value;
          return acc;
        }, {});
    
        console.log('Formatted Data:', formattedData); 
        setData(formattedData);
        setDates(Object.keys(formattedData));
        setDate(Object.keys(formattedData)[0] || '2035-02-01'); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, [selectedMonth, dataType, selectedButton, selectedVessels]);

  const getColor = (value, type) => {
    if (type === 'occurrence' || type === 'harbor') {
      const minValue = 0;
      const maxValue = 225;
  
      if (value === 0) {
        return '#3f53c6';
      } else if (value > 0 && value <= maxValue * 0.067) {
        const blueShade = 155 - Math.round((value / (maxValue * 0.067)) * 55);
        return `rgb(${blueShade}, ${blueShade}, 255)`;
      } else if (value > maxValue * 0.067 && value <= maxValue * 0.133) {
        const red = Math.round(((value - (maxValue * 0.067)) / (maxValue * 0.067)) * 255);
        const green = 128 + Math.round(((maxValue * 0.133 - value) / (maxValue * 0.067)) * 127);
        return `rgb(${red}, ${green}, 0)`;
      }
      return '#FF4500';
    } else if (type === 'dwell') {
      const minDwell = 0;
      const maxDwell = 28735322.833238;
  
      if (value === 0) {
        return '#3f53c6';
      } else if (value > 0 && value <= maxDwell * 0.007) {
        const blueShade = 155 - Math.round((value / (maxDwell * 0.007)) * 55);
        return `rgb(${blueShade}, ${blueShade}, 255)`;
      } else if (value > maxDwell * 0.007 && value <= maxDwell * 0.014) {
        const red = Math.round(((value - (maxDwell * 0.007)) / (maxDwell * 0.007)) * 255);
        const green = 128 + Math.round(((maxDwell * 0.014 - value) / (maxDwell * 0.007)) * 127);
        return `rgb(${red}, ${green}, 0)`;
      } else if (value > maxDwell * 0.014 && value <= maxDwell * 0.042) {
        const red = 255;
        const green = Math.round(((maxDwell * 0.042 - value) / (maxDwell * 0.014)) * 127);
        return `rgb(${red}, ${green}, 0)`;
      }
      return '#FF4500';
    }
  };
  
  

  const handleButtonClick = (button) => {
    setSelectedButton(button);
    setSelectedVessels([]);
    setSliderValue(0);
  };

  const handleDataTypeChange = (type) => {
    setDataType(type);
    setSliderValue(0);
  };

  const handleAddToDashboard = () => {
    setGraphs(graphs => [...graphs, {
      date,
      data,
      locations: selectedLocationTypes.flatMap(type => locationTypes[type]),
      ships,
      dataType,
    }]);
  };

  return (
    <Box p={4} width="100%">
      <Stack direction="row" spacing={4} align="center">
        <Button
          colorScheme="blue"
          onClick={() => handleButtonClick('Fishing Vessels')}
          isActive={selectedButton === 'Fishing Vessels'}
        >
          Fishing Vessels
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => handleButtonClick('Non-Fishing Vessels')}
          isActive={selectedButton === 'Non-Fishing Vessels'}
        >
          Non-Fishing Vessels
        </Button>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon="▼"
            isDisabled={selectedButton !== 'Non-Fishing Vessels'}
            bg="gray.200"
          >
            Select vessel types
          </MenuButton>
          <MenuList>
            <CheckboxGroup
              value={selectedVessels}
              onChange={(values) => setSelectedVessels(values)}>
              <MenuItem><Checkbox value="Ferry Passenger Vessel">Ferry Passenger Vessel</Checkbox></MenuItem>
              <MenuItem><Checkbox value="Cargo Vessel">Cargo Vessel</Checkbox></MenuItem>
              <MenuItem><Checkbox value="Research Vessel">Research Vessel</Checkbox></MenuItem>
              <MenuItem><Checkbox value="Tour Vessel">Tour Vessel</Checkbox></MenuItem>
              <MenuItem><Checkbox value="Other Vessel">Other Vessel</Checkbox></MenuItem>
              <MenuItem><Checkbox value="Ferry Cargo Vessel">Ferry Cargo Vessel</Checkbox></MenuItem>
            </CheckboxGroup>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon="▼" bg="gray.200">
            {format(new Date(2035, selectedMonth - 1), 'MMMM')}
          </MenuButton>
          <MenuList>
            {Array.from({ length: 12 }, (_, i) => i + 1).filter(month => month !== 1 && month !== 12).map((month) => (
              <MenuItem key={month} onClick={() => handleMonthSelect(month.toString().padStart(2, '0'))}>
                {format(new Date(2035, month - 1), 'MMMM')}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton as={Button} rightIcon="▼" bg="gray.200">
            Select location types
          </MenuButton>
          <MenuList>
            <CheckboxGroup
              value={selectedLocationTypes}
              onChange={(values) => setSelectedLocationTypes(values)}
            >
              {Object.keys(locationTypes).map((type, index) => (
                <MenuItem key={index}><Checkbox value={type}>{type}</Checkbox></MenuItem>
              ))}
            </CheckboxGroup>
          </MenuList>
        </Menu>
      </Stack>
      <Stack direction="row" spacing={4} align="center" mt={4}>
        <Button
          colorScheme="green"
          onClick={() => handleDataTypeChange('occurrence')}
          isActive={dataType === 'occurrence'}
        >
          Occurrence
        </Button>
        <Button
          colorScheme="green"
          onClick={() => handleDataTypeChange('dwell')}
          isActive={dataType === 'dwell'}
        >
          Dwell
        </Button>
        <Button
          colorScheme="green"
          onClick={() => handleDataTypeChange('harbor')}
          isActive={dataType === 'harbor'}
        >
          Harbor Report
        </Button>
        <Button
          colorScheme="blue"
          onClick={handleAddToDashboard}
        >
          Add the heatmap graph
        </Button>
      </Stack>
      <Box display="flex" flexDirection="column" width="100%" height="100%">
        <HeatmapComponent 
          date={date}
          data={data}
          locations={selectedLocationTypes.flatMap(type => locationTypes[type])}
          ships={ships}
          setShips={setShips}
          getColor={(value) => getColor(value, dataType)}
        />
      </Box>
    </Box>
  );
};

export default Heatmap;