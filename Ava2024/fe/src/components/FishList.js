import React from 'react';

const FishList = ({ fishTypes, onSelect }) => {
  console.log("FishList received fishTypes:", Array.from(fishTypes.entries())); 
  return (
    <div>
      <h3>Select Fish Type</h3>
      <select onChange={e => onSelect(e.target.value)}>
        <option value="">Select a fish type</option>
        {Array.from(fishTypes.entries()).map(([id, name]) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
    </div>
  );
};

export default FishList;
