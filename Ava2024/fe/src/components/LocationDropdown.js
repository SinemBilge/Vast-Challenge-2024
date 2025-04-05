import React from 'react';

const LocationDropdown = ({ locations, selectedLocation, onLocationChange }) => {
  return (
    <div>
      <label htmlFor="location-select">Select Location:</label>
      <select
        id="location-select"
        style={{ border: '1px solid grey' }}
        value={selectedLocation}
        onChange={e => onLocationChange(e.target.value)}
      >
        <option value="">--Select a Location--</option>
        {locations.map(location => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocationDropdown;
