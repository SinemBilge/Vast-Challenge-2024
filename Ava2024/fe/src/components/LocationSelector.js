import React from 'react';

const LocationSelector = ({ locations, onSelect }) => {
  return (
    <div>
      <h3>Select Location</h3>
      <select onChange={e => onSelect(e.target.value)}>
        <option value="">Select a location</option>
        {locations.map((location, index) => (
          <option key={index} value={location}>{location}</option>
        ))}
      </select>
    </div>
  );
};

export default LocationSelector;
