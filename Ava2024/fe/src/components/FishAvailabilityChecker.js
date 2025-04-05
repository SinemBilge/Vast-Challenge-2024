import React, { useState } from 'react';

const FishAvailabilityChecker = ({ fishToRegions }) => {
  const [fishName, setFishName] = useState('');
  const [result, setResult] = useState('');

  const checkFishAvailability = () => {
    const regions = fishToRegions.get(fishName.trim()) || [];
    if (regions.length > 0) {
      setResult(`${fishName} is available in the fishing ground(s): ${regions.join(', ')}`);
    } else {
      setResult(`${fishName} is not available in any fishing ground`);
    }
  };

  return (
    <div>
      <h3>Check Fish Availability</h3>
      <input
        type="text"
        value={fishName}
        onChange={(e) => setFishName(e.target.value)}
        placeholder="Enter fish name"
      />
      <button onClick={checkFishAvailability}>Check Availability</button>
      <p>{result}</p>
    </div>
  );
};

export default FishAvailabilityChecker;
