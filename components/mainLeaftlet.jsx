import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const OpenStreetMap = (props) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  useEffect(() => {
    if (!containerRef.current) return;

    const { location, scrollWheelZoom, draggable } = propsRef.current;

    const map = L.map(containerRef.current, {
      center: [location.lat, location.lng],
      zoom: 17,
      scrollWheelZoom: scrollWheelZoom,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "",
    }).addTo(map);

    const iconPerson = new L.Icon({
      iconUrl: "https://www.svgrepo.com/show/362123/map-marker.svg",
      iconAnchor: null,
      popupAnchor: null,
      shadowUrl: null,
      shadowSize: null,
      shadowAnchor: null,
      iconSize: new L.Point(50, 50),
    });

    L.marker([location.lat, location.lng], {
      draggable: draggable,
      icon: iconPerson,
    }).addTo(map);

    map.on("click", (e) => {
      propsRef.current.handleSelectPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ height: "450px", top: "0px" }} />;
};

export default OpenStreetMap;
