// HeatmapComponent.js
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { isValid } from 'date-fns';

const prioritizeShips = (ships = []) => {
  const priorityShips = ['Roach Robber', 'Snapper Snatcher'];
  return [
    ...priorityShips.filter(ship => ships.includes(ship)),
    ...ships.filter(ship => !priorityShips.includes(ship)),
  ];
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

export default HeatmapComponent;
