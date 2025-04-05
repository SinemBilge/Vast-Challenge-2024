import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './LineChart.css';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const theme = createTheme();

const TrendLineChart = ({ selectedMonth }) => {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8000/main/trend-line/');
                const data = response.data;

           
                const filteredData = data.filter(item => item.week.trim() === selectedMonth);

      
                const groupedData = filteredData.reduce((acc, item) => {
                    const week = item.week.trim(); 
                    if (!acc[week]) {
                        acc[week] = {
                            label: week,
                            data: [],
                            borderColor: '#007bff', 
                            backgroundColor: '#007bff',
                            fill: false,
                            tension: 0.1,
                        };
                    }
                    acc[week].data.push({
                        x: item.location_id.trim(), 
                        y: item.dwell_count,
                    });
                    return acc;
                }, {});

 
                const chartData = {
                    labels: Array.from(new Set(filteredData.map(item => item.location_id.trim()))),
                    datasets: Object.values(groupedData),
                };

                setChartData(chartData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching trend data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedMonth]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <ThemeProvider theme={theme}>
          <div className="trendline-container">
            <h1>Behaviors of Fishing Vessels Seasonal Graph</h1>
            <div className="chart-box">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Location',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Total presence time',
                      },
                    },
                  },
                  elements: {
                    line: {
                      tension: 0.4, 
                      borderWidth: 2,
                    },
                    point: {
                      radius: 4,
                      borderWidth: 2,
                      backgroundColor: '#007bff',
                      borderColor: '#007bff',
                    },
                  },
                }}
              />
            </div>
          </div>
        </ThemeProvider>
      );
};

export default TrendLineChart;
