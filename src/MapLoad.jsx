import React, {useEffect, useState, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import './MapLoad.css';

mapboxgl.accessToken = "pk.eyJ1Ijoia2VueW9ubCIsImEiOiJja2V3dml4c3gwNTN2MnluMXVqZnh2dG96In0.Rf1jMcyVc831BWikuxhB9g";

const MapLoad = () => {
  const [mapData, setMapData] = useState({
    lng: 5,
    lat: 34,
    zoom: 2
  })
  const mapContainerRef = useRef(null);
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/kenyonl/ckewvssax151z1ap9u8gh6geq',
      center: [mapData.lng, mapData.lat],
      zoom: mapData.zoom
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('move', () => {
      setMapData({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    })
    return () => map.remove();
  }, [])
  return (
    <div>
      <div className='sidebarStyle'>
        <div>
          Longitude: {mapData.lng} | Latitude: {mapData.lat} | Zoom: {mapData.zoom}
        </div>
      </div>
      <div className="mapContainer" ref={mapContainerRef}/>
    </div>
  )
}
export default MapLoad;