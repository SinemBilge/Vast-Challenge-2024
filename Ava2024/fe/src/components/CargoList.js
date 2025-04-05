import React from 'react';

const CargoSelector = ({ cargos, onSelect }) => {
  return (
    <div>
      <h3>Select Cargo</h3>
      <select onChange={e => onSelect(e.target.value)}>
        <option value="">Select a cargo</option>
        {cargos.map(cargo => (
          <option key={cargo.id} value={cargo.id}>
            {cargo.id} - {cargo.qty_tons || 0} tons
          </option>
        ))}
      </select>
    </div>
  );
};

export default CargoSelector;
