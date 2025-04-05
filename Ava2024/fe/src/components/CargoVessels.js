import React, { useEffect, useState } from 'react';
import HierarchicalMap from './HierarchicalMap';
import LocationDropdown from './LocationDropdown';
import MonthDropdown from './MonthDropdown';

const CargoVessels = () => {
  const [jsonData, setJsonData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('02'); 
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/main/cargo-vessel/')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setJsonData(data);
        const uniqueLocations = Array.from(new Set(data.map(item => item.location_id)));
        setLocations(uniqueLocations);
        if (uniqueLocations.length > 0) {
          setSelectedLocation(uniqueLocations[0]); 
        }
      })
      .catch(error => {
        console.error('Error fetching the JSON data:', error);
        setError(error);
      });
  }, []);

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const filteredData = jsonData.filter(item => {
    const matchesLocation = selectedLocation ? item.location_id === selectedLocation : true;
    const matchesMonth = selectedMonth ? item.transaction_date.startsWith(`2035-${selectedMonth}`) : true;
    return matchesLocation && matchesMonth;
  });

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  return (
    <div>
      <LocationDropdown
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
      />
      <MonthDropdown
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />
      {selectedLocation && filteredData.length > 0 && (
        <HierarchicalMap data={filteredData} />
      )}
    </div>
  );
};

export default CargoVessels;
