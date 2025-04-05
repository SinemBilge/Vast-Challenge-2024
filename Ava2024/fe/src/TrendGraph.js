import React, { useEffect, useState, useRef } from 'react';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    Tooltip,
    Legend
} from 'chart.js';
import axios from 'axios';
import './TrendGraph.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    Tooltip,
    Legend
);


const predefinedColors = {
    'Centralia': '#FF0000', 
    'Exit West': '#00FF00', 
    'Nav 3': '#0000FF',
    'Nav D': '#FFFF00', // Yellow
    'Nav B': '#FF00FF', // Magenta
    'Nav A': '#00FFFF', // Cyan
    'Nav C': '#800000', // Maroon
    'Nav 2': '#808000', // Olive
    'Nav 1': '#800080', // Purple
    'Exit East': '#008000', // Green
    'Exit South': '#000080', // Navy
    'Exit North': '#808080', // Gray
    'Nav E': '#FFA500', // Orange
    'Suna Island': '#FFC0CB', // Pink
    'Thalassa Retreat': '#A52A2A', // Brown
    'Makara Shoal': '#8A2BE2', // BlueViolet
    'Silent Sanctuary': '#DEB887', // BurlyWood
    'Cod Table': '#5F9EA0', // CadetBlue
    'Ghoti Preserve': '#D2691E', // Chocolate
    'Wrasse Beds': '#FF7F50', // Coral
    'Nemo Reef': '#6495ED', // CornflowerBlue
    'Don Limpet Preserve': '#FFF8DC', // Cornsilk
    'Tuna Shelf': '#DC143C', // Crimson
    'City of Haacklee': '#00FFFF', // Cyan
    'City of Himark': '#00008B', // DarkBlue
    'City of Lomark': '#008B8B',  // DarkCyan
    'City of Paackland': '#B8860B',  // DarkGoldenRod
    'City of Port Grove': '#A9A9A9',  // DarkGray
    'City of South Paackland': '#006400'   // DarkGreen
};

const TrendGraph = () => {
    const [chartData, setChartData] = useState({ datasets: [], weeks: [], vessels: [], locationColors: predefinedColors });
    const chartRef = useRef(null);

    useEffect(() => {
        axios.get('http://localhost:8000/main/trend-data/')
            .then(response => {
                const data = response.data;
                const groupedData = {};
                const weeks = new Set();
                const vessels = new Set();

                data.forEach(entry => {
                    weeks.add(entry.week);
                    vessels.add(entry.name);

                    const key = `${entry.week}-${entry.name}`;
                    if (!groupedData[key]) {
                        groupedData[key] = {
                            x: entry.week,
                            y: entry.name,
                            locations: []
                        };
                    }

                    groupedData[key].locations.push({
                        location_id: entry.location_id,
                        total_dwell: entry.total_dwell,
                        color: predefinedColors[entry.location_id] || '#000000'
                    });
                });

       
                const sortedVessels = Array.from(vessels).sort((a, b) => {
                    if (a === 'Roach Robber') return -1;
                    if (b === 'Roach Robber') return 1;
                    if (a === 'Snapper Snatcher') return 1;
                    if (b === 'Snapper Snatcher') return -1;
                    return a.localeCompare(b);
                });

                const datasets = [{
                    label: 'Heatmap',
                    data: Object.values(groupedData).map(dataPoint => ({
                        x: dataPoint.x,
                        y: dataPoint.y,
                        locations: dataPoint.locations
                    })),
                    backgroundColor: 'transparent', 
                    borderColor: 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    pointRadius: 15, 
                    pointHoverRadius: 20,
                    pointStyle: 'rect'
                }];

                setChartData({
                    datasets: datasets,
                    weeks: Array.from(weeks).sort(),
                    vessels: sortedVessels,
                    locationColors: predefinedColors
                });
            })
            .catch(error => {
                console.error('Error fetching data', error);
            });
    }, []);

    const customDrawPlugin = {
        id: 'customDrawPlugin',
        afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                dataset.data.forEach((dataPoint, index) => {
                    const meta = chart.getDatasetMeta(datasetIndex).data[index];
                    if (meta) {
                        const x = meta.x;
                        const y = meta.y;
    
                        const locations = dataPoint.locations || []; 
                        const size = meta.radius * 2.5 || 25; 
                        const segmentSize = size / locations.length;
    
                        ctx.translate(x - size / 2, y - size / 2);
    
                        locations.forEach((location, locIndex) => {
                            ctx.fillStyle = location.color;
                            ctx.fillRect(locIndex * segmentSize, 0, segmentSize, size);
                        });
    
                        ctx.translate(-(x - size / 2), -(y - size / 2));
                    }
                });
            });
            ctx.restore();


            const xAxis = chart.scales['x'];
            if (xAxis) {
                const x = xAxis.getPixelForValue('20'); 
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, chart.chartArea.top);
                ctx.lineTo(x, chart.chartArea.bottom);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red'; 
                ctx.stroke();
                ctx.restore();
            }
        }
    };

    ChartJS.register(customDrawPlugin);

    const options = {
        scales: {
            x: {
                type: 'category',
                labels: chartData.weeks || [],
                title: {
                    display: true,
                    text: 'Week',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                grid: {
                    display: true,
                    color: '#f1f1f1'
                },
                ticks: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                offset: true 
            },
            y: {
                type: 'category',
                labels: chartData.vessels || [],
                title: {
                    display: true,
                    text: 'Vessel',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                grid: {
                    display: true,
                    color: '#f1f1f1'
                },
                ticks: {
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                },
                offset: true 
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const dataPoint = context.raw;
                        return dataPoint.locations.map(location => 
                            `Location: ${location.location_id}, Total Dwell: ${location.total_dwell}`).join('\n');
                    }
                }
            }
        }
    };

    return (
        <div className="trendgraph-container">
            <div className="legend-container">
                {Object.keys(chartData.locationColors).map(location_id => (
                    <div key={location_id} className="legend-item">
                        <span className="legend-color-box" style={{ backgroundColor: chartData.locationColors[location_id] }}></span>
                        {location_id}
                    </div>
                ))}
            </div>
            <div className="chart-box">
                <div className="grid-background"></div>
                <Scatter 
                    ref={chartRef}
                    data={chartData} 
                    options={options} 
                />
            </div>
        </div>
    );
};

export default TrendGraph;