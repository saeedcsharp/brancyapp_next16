import { useEffect, useRef } from "react";
import { NeshanMapRef } from "@neshan-maps-platform/react-openlayers";
import dynamic from "next/dynamic";
import addMarker from "../akbar";
const NeshanMap = dynamic(() => import("@neshan-maps-platform/react-openlayers"), { ssr: false });
const onInit = (map) => {
  map.setMapType("osm-bright");
  map.switchTrafficLayer(true);
  map.switchPoiLayer(true);
  map.on("click", function (event) {
    const clickedCoordinate = map.getCoordinateFromPixel(event.pixel);
    // const clickedLonLat = map.transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326');
    console.log("Clicked Coordinate:", clickedCoordinate);
  });

  // map.on("click", function (event) {
  //   const clickedCoordinate = event.coordinate;
  //   addMarker(clickedCoordinate);
  //   console.log("Clicked Coordinate:", clickedCoordinate);
  // });
};

const Neshan = () => {
  const mapRef = (useRef < NeshanMapRef) | (null > null);
  //   const clickedCoordinate = event.coordinate;
  useEffect(() => {
    if (mapRef.current?.map) {
      // mapRef.current?.map.switchTrafficLayer(true);
      // mapRef.current?.map.setMapType("standard-night");

      /* mapRef.current?.map.on("click", function (event) {
      //   const clickedCoordinate = mapRef.current?.map.getCoordinateFromPixel(event.pixel);
      //   // const clickedLonLat = map.transform(clickedCoordinate, 'EPSG:3857', 'EPSG:4326');
      //   console.log("Clicked Coordinate:", clickedCoordinate);*/
      // });
      setTimeout(() => {
        const mapRef = (useRef < NeshanMapRef) | (null > null);

        addMarker([], mapRef);
      }, 1000);
    }
  }, []);
  return (
    <div style={{ width: "500px" }}>
      <NeshanMap
        mapKey="web.1a49cdec6b924862b97cdb6b28b2eae2"
        defaultType="dreamy"
        center={{ latitude: 35.7665394, longitude: 51.4749824 }}
        style={{ height: "500px", width: "500px" }}
        zoom={13}
        onInit={onInit}
        poi={true}></NeshanMap>
      <hr />
    </div>
  );
};

export default Neshan;
