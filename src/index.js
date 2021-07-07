import React from 'react';
import {render} from 'react-dom';
import Map from './Map/Map';
import GMap from './Map/GMap'

const root = document.getElementById("root");
render(<GMap/>, root);