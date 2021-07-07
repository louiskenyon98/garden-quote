import React, {useCallback, useState} from 'react';
import {GoogleMap, useJsApiLoader} from "@react-google-maps/api";

const style = {
  width: '100%',
  height: '100%'
};



const GMap = () => {
  const {isLoaded} = useJsApiLoader({
    id: 'lawnnurse-map',
    googleMapsApiKey:'API KEY HERE'
  })
  const [map, setMap] = useState(null);

  const onLoad = useCallback()

  return (
    <div>hello world</div>
  )
}

export default GMap;