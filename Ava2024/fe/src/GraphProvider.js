import React, { useState, useEffect, createContext, useContext } from 'react';


const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
  const [graphs, setGraphs] = useState(() => {
    const savedGraphs = localStorage.getItem('graphs');
    return savedGraphs ? JSON.parse(savedGraphs) : [];
  });

  useEffect(() => {
    localStorage.setItem('graphs', JSON.stringify(graphs));
  }, [graphs]);

  return (
    <GraphContext.Provider value={{ graphs, setGraphs }}>
      {children}
    </GraphContext.Provider>
  );
};


export const useGraphs = () => useContext(GraphContext);
