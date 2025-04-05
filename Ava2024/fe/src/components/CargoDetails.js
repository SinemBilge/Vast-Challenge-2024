import React from 'react';

const CargoDetails = ({ cargo, fishName, fishRegion }) => {
  return (
    <div>
      <h3>Cargo Details</h3>
      <p>ID: {cargo.id}</p>
      <p>Quantity (tons): {cargo.qty_tons}</p>
      <p>Date: {cargo.date}</p>
      <p>Last Edited By: {cargo._last_edited_by}</p>
      <p>Last Edited Date: {cargo._last_edited_date}</p>
      <p>Raw Source: {cargo._raw_source}</p>
      <p>Algorithm: {cargo._algorithm}</p>
      {fishName && <p>Fish Type: {fishName}</p>}
      {fishRegion && <p>Fishing Region: {fishRegion}</p>}
    </div>
  );
};

export default CargoDetails;
