import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

const OpenStreetMap = (props) => {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        props.handleSelectPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return false;
  };
  const iconPerson = new L.Icon({
    iconUrl: "https://www.svgrepo.com/show/362123/map-marker.svg",
    //iconRetinaUrl: "https://dl1.brancy.app/a1.svg",
    iconAnchor: null,
    popupAnchor: null,
    shadowUrl: null,
    shadowSize: null,
    shadowAnchor: null,
    iconSize: new L.Point(50, 50),
    // className: "leaflet-div-icon",
  });
  return (
    <MapContainer
      center={props.location}
      zoom={17}
      scrollWheelZoom={props.scrollWheelZoom}
      style={{ height: "450px", top: "0px" }}>
      <MapEvents />
      <TileLayer attribution="" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        position={[props.location.lat, props.location.lng]}
        draggable={props.draggable}
        icon={iconPerson}></Marker>
    </MapContainer>
  );
};

export default OpenStreetMap;
