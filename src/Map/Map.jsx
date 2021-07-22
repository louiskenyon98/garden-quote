import React, {useEffect, useState, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import axios from 'axios';
import {trackPromise} from "react-promise-tracker";
import {usePromiseTracker} from "react-promise-tracker";
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import area from '@turf/area';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map.css';
import continueArrow from '../assets/arrow-right-solid.svg';
import Modal from '../Modal/Modal';
import {soilDescriptions, soilTypes} from "../util/soilTypeDecoder";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const geocoderOptions = {
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  proximity: {Latitude: 51.081130, Longitude: -1.182660}
}

const Map = () => {
  const [mapData, setMapData] = useState({
    lng: 5,
    lat: 34,
    zoom: 2
  });
  const [areaRender, setAreaRender] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [soilInfo, setSoilInfo] = useState({});
  const {promiseInProgress} = usePromiseTracker();

  const mapContainerRef = useRef(null);

  const ambeeOptions = {
    method: 'GET',
    url: process.env.REACT_APP_AMBEE_API_URL,
    params: {lat: mapData.lat, lng: mapData.lng},
    headers: {
      'x-api-key': process.env.REACT_APP_AMBEE_API_KEY,
      'Content-type': 'application/json'
    }
  }

  const soilgridOptions = {
    method: 'GET',
    url: process.env.REACT_APP_SOILGRIDS_API_URL,
    params: {lon: mapData.lng, lat: mapData.lat, number_classes: 5},
    headers: {'Content-type': 'application/json'}
  }

  const {REACT_APP_TEST_VAR} = process.env;
  console.log(REACT_APP_TEST_VAR)

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
        } else if (e.type !== 'draw.delete') {
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

  const getLocalInfoAsync = async () => {
    //todo: cache previous searches in cookie on users machine, then iterate over this to see if the search has already been made before completing another api call.
    setModalVisible(true);
    let soilInfo = {};
    try {
      const ambeeResponse = await trackPromise(axios.request(ambeeOptions));
      soilInfo = {
        ...soilInfo,
        temperature: Math.round(ambeeResponse.data.data[0].soil_temperature),
        moisture: Math.round((ambeeResponse.data.data[0].soil_moisture) * 100) / 100
      }
      const soilGridResponse = await trackPromise(axios.request(soilgridOptions));

      switch (soilGridResponse && soilGridResponse.data && soilGridResponse.data.wrb_class_name) {
        case soilTypes.LUVISOLS:
          soilInfo = {...soilInfo, description: soilDescriptions.LUVISOLS};
          break;
        case soilTypes.CAMBISOLS:
          soilInfo = {...soilInfo, description: soilDescriptions.CAMBISOLS};
          break;
        default:
          console.log('soilgrid data ', soilGridResponse.data)
      }
      setSoilInfo(soilInfo)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <Modal show={modalVisible} handleClose={() => setModalVisible(false)}>
        <p>
          Your lawn was {areaRender} m<sup>2</sup>, this will cost
          you <span>&#163;</span>{Math.round((areaRender * 0.35) * 100) / 100} per month.
        </p>
        <br/>

        {promiseInProgress === true ?
          <p>Loading detailed soil information</p>
          :
          <p>
            {`${soilInfo.description} the moisture level is ${soilInfo.moisture}% and the soil temperature is currently ${soilInfo.temperature} degrees celsius.`}
          </p>
        }


      </Modal>
      <div className="mapContainer" ref={mapContainerRef}/>
      {
        areaRender &&
        <div className="calculationBox">
          <p>Your garden's area:</p>
          <div id="calculated-area">
            {areaRender} m<sup>2</sup>

          </div>
          <div className="nextStep">
            <p>Click here to continue</p>
            <img
              style={{cursor: "pointer"}}
              src={continueArrow}
              alt="Continue arrow"
              onClick={getLocalInfoAsync}
            />
          </div>

        </div>
      }
    </div>
  )
}
export default Map;