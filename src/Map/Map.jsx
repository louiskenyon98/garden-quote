import React, {useEffect, useState, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import axios from 'axios';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import area from '@turf/area';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map.css';
import continueArrow from '../assets/arrow-right-solid.svg';
import Modal from '../Modal/Modal';

mapboxgl.accessToken = "pk.eyJ1Ijoia2VueW9ubCIsImEiOiJja3FyMzZyemIwNzBlMm9ub2Y5ZmtlMmVjIn0.ovB8kRsPo1QzoohRq3IF-g";

const geocoderOptions = {
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
}

const Map = () => {
  const [mapData, setMapData] = useState({
    lng: 5,
    lat: 34,
    zoom: 2
  });
  const [areaRender, setAreaRender] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapCoordData, setMapCoordData] = useState();

  const mapContainerRef = useRef(null);

  const options = {
    method: 'GET',
    url: 'https://api.ambeedata.com/soil/latest/by-lat-lng',
    params: {lat: mapData.lat, lng: mapData.lng},
    headers: {'x-api-key': 'AMBEE_API_KEY', 'Content-type': 'application/json'}
  }

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
        let rounded_area = Math.round(area(data) * 100) / 100;
        setAreaRender(rounded_area);
      } else {
        answer.innerHTML = ''
        if (e.type === 'draw.delete') {
          setAreaRender(0);
        }
        else if (e.type !== 'draw.delete') {
          alert('Use the draw tools to draw a polygon')
        }
      }
    };

    map.on('draw.create', updateArea);
    map.on('draw.delete', updateArea);
    map.on('draw.update', updateArea);

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl(), 'top-right');
    map.addControl(new MapboxGeocoder(geocoderOptions), 'top-left')
    map.on('move', () => {
      setMapData({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    })
    return () => map.remove();
  }, [])

  const logCoords = () => {
    setModalVisible(true)
    console.log('data', options)
    axios.request(options).then((response) => {
      console.log('soil api response', response.data)
    }).catch((error) => {
      console.error(error)
    })


  }

  return (
    <div>
      <Modal show={modalVisible} handleClose={() => setModalVisible(false)}>
        <p>Your lawn was {areaRender} m<sup>2</sup>, this will cost
          you <span>&#163;</span>{Math.round((areaRender * 0.35) * 100) / 100} per month.</p>
        {/*<button onClick={logCoords}>Click here to log coords</button>*/}
      </Modal>
      <div className="mapContainer" ref={mapContainerRef}/>
      {/*todo: get location data from polygon on modal click, then call soil data api and get that information.*/}
      {
        areaRender &&
        <div className="calculationBox">
          <p>Your garden's area:</p>
          <div id="calculated-area">
            {areaRender} m<sup>2</sup>

          </div>
          <div className="nextStep">
            <p>Click here to continue</p>
            <img style={{cursor: "pointer"}} src={continueArrow} alt="Continue arrow"
                 onClick={logCoords}/>
          </div>

        </div>
      }
    </div>
  )
}
export default Map;