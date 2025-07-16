import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// أيقونة مخصصة للطرفين
const patientIcon = new L.Icon({
  iconUrl: "/user-placeholder.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});
const providerIcon = new L.Icon({
  iconUrl: "/nurse-icon.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// دالة حساب المسافة بين نقطتين بالإحداثيات (كيلومتر)
function haversine(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function MapDistance({ patient, provider, orderId, liveTrack }) {
  // liveTrack=true: تفعيل التتبع الحي للطرفين
  const [patientPos, setPatientPos] = useState([parseFloat(patient?.lat), parseFloat(patient?.lng)]);
  const [providerPos, setProviderPos] = useState([parseFloat(provider?.lat), parseFloat(provider?.lng)]);

  // تحديث المواقع تلقائياً كل 10 ثواني إذا كان liveTrack مفعل
  useEffect(() => {
    if (!liveTrack || !orderId) return;
    const interval = setInterval(() => {
      fetch(`https://helthend-production.up.railway.app/orders/${orderId}`)
        .then(res => res.json())
        .then(order => {
          if (order.location?.lat && order.location?.lng) setPatientPos([parseFloat(order.location.lat), parseFloat(order.location.lng)]);
          if (order.providerLocation?.lat && order.providerLocation?.lng) setProviderPos([parseFloat(order.providerLocation.lat), parseFloat(order.providerLocation.lng)]);
        });
    }, 10000);
    return () => clearInterval(interval);
  }, [liveTrack, orderId]);

  if (!patientPos[0] || !patientPos[1]) return <div>لا توجد بيانات إحداثيات كافية</div>;
  let distance = null, estTime = null, cost = null;
  if (providerPos[0] && providerPos[1]) {
    distance = haversine(patientPos[0], patientPos[1], providerPos[0], providerPos[1]);
    estTime = Math.round((distance / 0.5) + 10); // 0.5 كم/دقيقة = 30 كم/س
    cost = Math.round(distance * 5);
  }
  return (
    <div style={{width:'100%',height:350,margin:'16px 0',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 12px #3182ce22'}}>
      <MapContainer center={patientPos} zoom={13} style={{height:350,width:'100%'}} scrollWheelZoom={true}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={patientPos} icon={patientIcon}>
          <Popup>موقع المريض</Popup>
        </Marker>
        {providerPos[0] && providerPos[1] && (
          <Marker position={providerPos} icon={providerIcon}>
            <Popup>موقع مقدم الرعاية</Popup>
          </Marker>
        )}
        {providerPos[0] && providerPos[1] && (
          <Polyline positions={[providerPos, patientPos]} color="#3182ce" />
        )}
      </MapContainer>
      <div style={{padding:8,background:'#fff',borderRadius:'0 0 12px 12px',boxShadow:'0 2px 8px #0001',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span>المسافة: <b>{distance ? distance.toFixed(2) : '-'} كم</b></span>
        <span>الوقت المتوقع: <b>{estTime || '-'} دقيقة</b></span>
        <span>تكلفة الوصول: <b>{cost || '-'} ج.م</b></span>
      </div>
    </div>
  );
}
