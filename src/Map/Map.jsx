import React, {useEffect, useState, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import area from '@turf/area';
import './Map.css';

mapboxgl.accessToken = "pk.eyJ1Ijoia2VueW9ubCIsImEiOiJja2V3dml4c3gwNTN2MnluMXVqZnh2dG96In0.Rf1jMcyVc831BWikuxhB9g";

const Map = () => {
  const [mapData, setMapData] = useState({
    lng: 5,
    lat: 34,
    zoom: 2
  });
  const [areaRender, setAreaRender] = useState(0);

  const mapContainerRef = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/kenyonl/ckewvssax151z1ap9u8gh6geq',
      center: [mapData.lng, mapData.lat],
      zoom: mapData.zoom
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    map.addControl(draw);

    const updateArea = (e) => {
      let data = draw.getAll();
      let answer = document.getElementById('calculated-area');
      if (data.features.length > 0) {
        // let area = area(data);
        let rounded_area = Math.round(area(data) * 100) / 100;
        setAreaRender(rounded_area);
        // answer.innerHTML = '<p><strong>' +
        //   {rounded_area} +
        //   '</strong></p><p>square meters</p>';
      } else {
        answer.innerHTML = '';
        if (e.type !== 'draw.delete') {
          alert('Use the draw tools to draw a polygon')
        }
      }
    };
    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);

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
      <div className="calculationBox">
        <p>Draw a polygon</p>
        <div id="calculated-area">{areaRender} meters squared</div>
      </div>
    </div>
  )
}
export default Map;