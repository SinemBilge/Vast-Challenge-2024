import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import * as XLSX from 'xlsx';

const MapComponent = () => {
  const [data, setData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [heatData, setHeatData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching Excel data...');
        const excelResponse = await axios.get('/sinem-location.xlsx', { responseType: 'arraybuffer' });
        console.log('Fetching JSON data...');
        const jsonResponse = await axios.get('/mc2.json');
        console.log('Fetching GeoJSON data...');
        const geoJsonResponse = await axios.get('/Oceanus.geojson');

        console.log('Parsing Excel data...');
        const excelData = parseExcelData(excelResponse.data);
        const vesselData = jsonResponse.data;
        const geoJsonData = geoJsonResponse.data;

        setData(excelData);
        setGeoData(geoJsonData);

        console.log('Filtering and combining data...');
        const filtered = filterAndCombineData(excelData, vesselData);
        setFilteredData(filtered);
        setHeatData(filtered.map(row => [row.Latitude, row.Longitude]));

        console.log('Data fetching and processing complete.');
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const parseExcelData = (data) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headers = jsonData[0];
    const rows = jsonData.slice(1);

    return rows.map(row => {
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = row[index];
      });
      return entry;
    });
  };

  const filterAndCombineData = (excelData, vesselData) => {
    const locationMapping = {};
    excelData.forEach(row => {
      const name = row.Name.trim().toLowerCase();
      locationMapping[name] = { Latitude: row.Latitude, Longitude: row.Longitude };
    });

    const transactions = vesselData.links.filter(link => link.type === 'Event.Transaction');
    const combinedData = transactions.map(trans => ({
      cargo_id: trans.source,
      date: trans.date,
      location: trans.target.trim().toLowerCase(),
      Latitude: locationMapping[trans.target.trim().toLowerCase()]?.Latitude,
      Longitude: locationMapping[trans.target.trim().toLowerCase()]?.Longitude
    })).filter(entry => entry.Latitude && entry.Longitude);

    return combinedData;
  };

  if (!data || !geoData || !filteredData || !heatData) return <div>Loading...</div>;

  return (
    <MapContainer center={[data[0].Latitude, data[0].Longitude]} zoom={6} style={{ height: '600px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON data={geoData} style={feature => ({
        fillColor: regionColors[feature.properties.Name.toLowerCase()] || 'gray',
        weight: 2,
        color: 'black',
        fillOpacity: 0.7
      })} />
      {filteredData.map((row, idx) => (
        <CircleMarker key={idx} center={[row.Latitude, row.Longitude]} radius={8} color="purple" fillOpacity={0.6}>
          <Tooltip>
            <div>
              <strong>Cargo ID:</strong> {row.cargo_id}<br />
              <strong>Date:</strong> {row.date}<br />
              <strong>Location:</strong> {row.location}
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

const regionColors = {
  'centralia': 'lightblue',
  'cod table': 'lightcyan',
  'don limpet preserve': 'orange',
  'exit east': 'yellow',
  'exit north': 'lightgreen',
  'haacklee': 'pink',
  'himark': 'lightgray',
  'lomark': 'lightcoral',
  'makara shoal': 'lightsalmon',
  'nav 1': 'lightseagreen',
  'nav 2': 'lightsteelblue',
  'nav 3': 'lightskyblue',
  'nav a': 'lightsteelblue',
  'nav b': 'lightyellow',
  'nav c': 'lightsteelblue',
  'nav d': 'lightgreen',
  'nav e': 'lightcoral',
  'paackland': 'lightgoldenrodyellow',
  'port grove': 'lightpink',
  'silent sanctuary': 'lightgray',
  'suna island': 'lightseagreen',
  'thalassa retreat': 'lightblue',
  'tuna shelf': 'lightyellow',
  'wrasse beds': 'lightgray',
  'exit south': 'lightsteelblue',
  'ghoti preserve': 'yellow',
  'nemo reef': 'pink'
};

export default MapComponent;
