import React, {useEffect, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import './MapLoad.css';

mapboxgl.accessToken = "pk.eyJ1Ijoia2VueW9ubCIsImEiOiJja2V3dml4c3gwNTN2MnluMXVqZnh2dG96In0.Rf1jMcyVc831BWikuxhB9g";

const MapLoad = (props) => {
  const [mapData, setMapData] = useState({});
  useEffect(() => {
    if (!Object.keys(mapData).length) {
      setMapData({
        lng: 5,
        lat: 34,
        zoom: 2
      })
    } else {
      const map = new mapboxgl.Map({
        container: document.getElementById("mapContainer"),
        style: 'mapbox://styles/kenyonl/ckewvssax151z1ap9u8gh6geq',
        center: [mapData.lng, mapData.lat],
        zoom: mapData.zoom
      });
      map.on('move', () => {
        setMapData({
          lng: map.getCenter().lng.toFixed(4),
          lat: map.getCenter().lat.toFixed(4),
          zoom: map.getZoom().toFixed(2)
        });
      })
    }


  }, [mapData])
  return (
    <div>
      <div>
        <div className='sidebarStyle'>Longitude: {mapData.lng} | Latitude: {mapData.lat} | Zoom: {mapData.zoom}</div>
      </div>
      <div style={{position: "absolute", top: 0, right: 0, left: 0, bottom: 0}} id="mapContainer"
           className="mapContainer"/>
    </div>
  )
}
export default MapLoad;