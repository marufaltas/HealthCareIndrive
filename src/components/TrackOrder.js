import React, { useEffect, useState } from "react";
import MapDistance from "./MapDistance";
import "./TrackOrder.css";

// دالة لحساب الوقت المقدر للوصول (بناءً على المسافة)
function estimateArrivalTime(lat1, lng1, lat2, lng2) {
  // حساب المسافة بين نقطتين (Haversine)
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  // سرعة افتراضية 40 كم/س
  const speed = 40;
  const time = distance / speed * 60; // بالدقائق
  return Math.round(time);
}

export default function TrackOrder({ user }) {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetch(`https://helthend-production.up.railway.app/orders?patientId=${user.id}`)
      .then(res => res.json())
      .then(setOrders);
  }, [user]);

  if (!user) return null;

  if (selected) {
    const order = selected;
    return (
      <div style={{maxWidth:700,margin:"24px auto",background:'#fff',borderRadius:16,boxShadow:'0 2px 16px #3182ce22',padding:24}}>
        <h2 style={{color:'#3182ce'}}>تفاصيل الطلب</h2>
        <div><b>الخدمات المطلوبة:</b> {order.serviceNames?.join(", ")}</div>
        <div><b>السعر الأساسي:</b> {order.basePrice} ج.م</div>
        <div><b>السعر المقترح:</b> {order.suggestedPrice || '-'} ج.م</div>
        <div><b>مقدم الرعاية:</b> {order.providerName || '-'} ({order.providerPhone || '-'})</div>
        <MapDistance patient={order.location} provider={order.providerLocation || {}} orderId={order.id} liveTrack={true} />
        <button style={{marginTop:16}} onClick={()=>setSelected(null)}>رجوع</button>
      </div>
    );
  }

  return (
    <div style={{maxWidth:700,margin:"24px auto"}}>
      <h2 style={{color:'#3182ce'}}>طلباتك الحالية</h2>
      {orders.length === 0 && <div style={{color:'#888',fontSize:18,padding:24}}>لا توجد طلبات مسجلة لهذا الحساب حتى الآن.</div>}
      {orders.length > 0 && (
        <>
          {orders.map(order => (
            <div key={order.id} style={{background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #3182ce22',padding:16,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',border: order.status==="accepted"?"2px solid #38b2ac":order.status==="rejected"?"2px solid #e53e3e":"2px solid #e2e8f0"}} onClick={()=>setSelected(order)}>
              <div>
                <b>{order.serviceNames?.join(", ") || order.serviceName || "-"}</b>
                <div style={{fontSize:13,color:'#666'}}>السعر: {order.basePrice} ج.م</div>
                <div style={{fontSize:13,color:'#666'}}>مقدم الرعاية: {order.providerName || '-'}</div>
                <div style={{fontSize:13,color:'#888'}}>الحالة: {order.status === "new" ? "جديد" : order.status === "accepted" ? "مقبول" : order.status === "rejected" ? "مرفوض" : order.status === "done" ? "تم الإنجاز" : order.status}</div>
              </div>
              <span style={{color:'#3182ce',fontWeight:700}}>تفاصيل &rarr;</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}