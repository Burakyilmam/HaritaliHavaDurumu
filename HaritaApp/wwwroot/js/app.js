import { CreateMap } from './map.js';
import { TurkeyGeoJsonDatas } from './cityLayer.js';

document.addEventListener("DOMContentLoaded", function () {

    CreateMap(39.0, 35.0, 4, 18);
    TurkeyGeoJsonDatas();
});