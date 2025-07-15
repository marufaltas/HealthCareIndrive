import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const patientLocation = {lat: 30.0444, lng: 31.2357}; // القاهرة
const nurseLocation = {lat: 30.0500, lng: 31.2333}; // قريب

export default function MapTracking() {
  // مثال تقديري للوقت (يمكن تحسينه عبر API Directions)
  const eta = "5 دقائق";

  return (
    <div style={{padding: 30}}>
      <LoadScript googleMapsApiKey="AIzaSyAtWAXYyDxKpvkP3JpaJemL5ZmHjatVYh4">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={patientLocation}
          zoom={14}
        >
          <Marker position={patientLocation} label="مريض" />
          <Marker position={nurseLocation} label="ممرض" />
        </GoogleMap>
      </LoadScript>
      <div style={{marginTop: 20, display: "flex", justifyContent: "space-around"}}>
        <div>
          <b>المريض:</b> القاهرة
        </div>
        <div>
          <b>الممرض:</b> قريب من المريض
        </div>
        <div>
          <b>الوقت المقدر:</b> {eta}
        </div>
      </div>
    </div>
  );
}