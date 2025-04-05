import React from 'react';

const VesselList = ({ vessels, onSelect }) => {
  console.log("VesselList received vessels:", vessels);
  return (
    <div>
      <h3>Select Vessel</h3>
      <select onChange={e => onSelect(e.target.value)}>
        <option value="">Select a vessel</option>
        {Array.from(vessels.entries()).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
    </div>
  );
};

export default VesselList;
