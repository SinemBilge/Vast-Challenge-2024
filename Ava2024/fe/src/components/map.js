import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import * as XLSX from 'xlsx';
import centroid from '@turf/centroid';
import { parseData } from '../dataParser'; 

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

const MapComponent = ({ selectedCargo }) => {
  const [data, setData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [fishingRegions, setFishingRegions] = useState(new Map());
  const [fishToRegions, setFishToRegions] = useState(new Map());
  const [cargoToFish, setCargoToFish] = useState(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const excelResponse = await axios.get('/sinem-location.xlsx', { responseType: 'arraybuffer' });
        const jsonResponse = await axios.get('/mc22.json');
        const geoJsonResponse = await axios.get('/Oceanus.geojson');

        const excelData = parseExcelData(excelResponse.data);
        const vesselData = jsonResponse.data;
        const geoJsonData = geoJsonResponse.data;

        setData(excelData);
        setGeoData(geoJsonData);

        const combinedData = filterAndCombineData(excelData, vesselData);
        setAllData(combinedData);

        const fishingRegionsData = parseFishingRegions(geoJsonData);
        setFishingRegions(fishingRegionsData);

        const parsedData = parseData();
        setFishToRegions(parsedData.fishToRegions);
        setCargoToFish(parsedData.cargoToFish);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCargo) {
      const filtered = allData.filter(row => row.cargo_id === selectedCargo);
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [selectedCargo, allData]);

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
      Longitude: locationMapping[trans.target.trim().toLowerCase()]?.Longitude,
      fishing_region: trans.fishing_region?.trim().toLowerCase() 
    })).filter(entry => entry.Latitude && entry.Longitude);

    return combinedData;
  };

  const parseFishingRegions = (data) => {
    const regions = new Map();
    data.features.forEach(feature => {
      const name = feature.properties.Name.trim().toLowerCase();
      if (feature.properties.type === 'Entity.Location.Region' || feature.properties.type === 'Entity.Location.Point') {
        const geometry = feature.geometry;
        if (geometry.type === 'Point') {
          regions.set(name, {
            Latitude: geometry.coordinates[1], 
            Longitude: geometry.coordinates[0]
          });
        } else if (geometry.type === 'Polygon') {
          const regionCentroid = centroid(feature);
          regions.set(name, {
            Latitude: regionCentroid.geometry.coordinates[1],
            Longitude: regionCentroid.geometry.coordinates[0]
          });
        }
      }
    });
    return regions;
  };

  if (!data || !geoData || !fishingRegions || !cargoToFish) return <div>Loading...</div>;


  return (
    <MapContainer center={[data[0].Latitude, data[0].Longitude]} zoom={6} style={{ height: '600px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <GeoJSON 
        data={geoData} 
        style={feature => ({
          fillColor: regionColors[feature.properties.Name.toLowerCase()] || 'gray',
          weight: 2,
          color: 'black',
          fillOpacity: 0.7
        })}
        onEachFeature={(feature, layer) => {
          layer.bindTooltip(feature.properties.Name);
        }}
      />
      {filteredData.map((row, idx) => {
        const fishingRegionsForCargo = Array.from(cargoToFish.get(row.cargo_id) || []); 
        return (
          <React.Fragment key={idx}>
            <CircleMarker center={[row.Latitude, row.Longitude]} radius={8} color="purple" fillOpacity={0.6}>
              <Tooltip>
                <div>
                  <strong>Cargo ID:</strong> {row.cargo_id}<br />
                  <strong>Date:</strong> {row.date}<br />
                  <strong>Location:</strong> {row.location}<br /> 
                  <strong>Fishing Regions:</strong> {fishingRegionsForCargo.join(', ')}<br /> 
           

                </div>
              </Tooltip>
            </CircleMarker>
            {fishingRegionsForCargo.map(regionName => {
              const regionCoords = fishingRegions.get(regionName.toLowerCase());
              if (regionCoords) {
                return (
                  <Polyline key={regionName} positions={[
                    [regionCoords.Latitude, regionCoords.Longitude],
                    [row.Latitude, row.Longitude]
                  ]} color="blue" />
                );
              } else {
                console.warn(`Coordinates not found for fishing region ${regionName}`);
                return null;
              }
            })}
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
