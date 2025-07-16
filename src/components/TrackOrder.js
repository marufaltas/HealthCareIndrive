import React, { useEffect, useState } from "react";
import MapDistance from "./MapDistance";
import ProviderAcceptedPopup from "./ProviderAcceptedPopup";
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

function TrackOrder({ user }) {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAcceptedPopup, setShowAcceptedPopup] = useState(false);
  const [acceptedProvider, setAcceptedProvider] = useState("");
  // حفظ معرفات الطلبات التي تم إظهار إشعار القبول لها
  const [shownAcceptedIds, setShownAcceptedIds] = useState([]);

  useEffect(() => {
    if (!user) return;
    // جلب الطلبات الحالية للمريض
    fetch(`https://helthend-production.up.railway.app/orders?patientId=${user.id}`)
      .then(res => res.json())
      .then(newOrders => {
        // ابحث عن طلب جديد تم قبوله الآن ولم يظهر إشعاره من قبل
        const justAccepted = newOrders.filter(o => o.status === 'accepted' && o.providerId && !shownAcceptedIds.includes(o.id));
        if (justAccepted.length > 0) {
          setAcceptedProvider(justAccepted[0].providerName || "");
          setShowAcceptedPopup(true);
          setShownAcceptedIds(prev => [...prev, justAccepted[0].id]);
        }
        setOrders(newOrders);
      });
    // eslint-disable-next-line
  }, [user, shownAcceptedIds]);

  if (!user) return null;

  if (showAcceptedPopup) {
    return <ProviderAcceptedPopup providerName={acceptedProvider} onClose={() => setShowAcceptedPopup(false)} />;
  }

  if (selected) {
    const order = selected;
    // تحديد نسبة التقدم بناءً على الحالة
    let progress = 0;
    let progressColor = '#3182ce';
    let statusLabel = '';
    if (order.status === 'new') { progress = 20; statusLabel = 'جديد'; progressColor = '#a0aec0'; }
    else if (order.status === 'accepted') { progress = 60; statusLabel = 'مقبول'; progressColor = '#38b2ac'; }
    else if (order.status === 'done') { progress = 100; statusLabel = 'تم الإنجاز'; progressColor = '#43a047'; }
    else if (order.status === 'rejected') { progress = 100; statusLabel = 'مرفوض'; progressColor = '#e53e3e'; }
    return (
      <div style={{maxWidth:700,margin:"24px auto",background:'#fff',borderRadius:16,boxShadow:'0 2px 16px #3182ce22',padding:24}}>
        <h2 style={{color:'#3182ce'}}>تفاصيل الطلب</h2>
        <div style={{marginBottom:18}}>
          <b>الخدمات المطلوبة:</b> {order.serviceNames?.join(", ")}
        </div>
        <div style={{marginBottom:8}}><b>السعر الأساسي:</b> {order.basePrice} ج.م</div>
        <div style={{marginBottom:8}}><b>السعر المقترح:</b> {order.suggestedPrice || '-'} ج.م</div>
        <div style={{marginBottom:8}}><b>مقدم الرعاية:</b> {(order.status === 'accepted' || order.status === 'done') ? (order.providerName || '-') : '-'} {(order.status === 'accepted' || order.status === 'done') ? `(${order.providerPhone || '-'})` : ''}</div>
        <div style={{marginBottom:18}}>
          <b>الحالة:</b> <span style={{color:progressColor,fontWeight:'bold'}}>{statusLabel}</span>
        </div>
        {/* Progress Bar */}
        <div style={{background:'#e2e8f0',borderRadius:8,height:16,marginBottom:18,overflow:'hidden'}}>
          <div style={{width:`${progress}%`,background:progressColor,height:'100%',transition:'width 0.5s'}}></div>
        </div>
        <MapDistance patient={order.location} provider={order.providerLocation || {}} orderId={order.id} liveTrack={true} />
        {(order.status === 'accepted') && (
          <button
            style={{marginTop:16,background:'#43a047',color:'#fff',padding:'12px 32px',border:'none',borderRadius:8,fontWeight:'bold',fontSize:'1.1em',cursor:'pointer'}}
            onClick={async ()=>{
              await fetch(`https://helthend-production.up.railway.app/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'done' })
              });
              setSelected(null);
              // تحديث الطلبات بعد الإنهاء
              fetch(`https://helthend-production.up.railway.app/orders?patientId=${user.id}`)
                .then(res => res.json())
                .then(setOrders);
            }}
          >اتمام الطلب بنجاح</button>
        )}
        <button style={{marginTop:16,marginRight:8}} onClick={()=>setSelected(null)}>رجوع</button>
      </div>
    );
  }

  return (
    <div style={{maxWidth:700,margin:"24px auto"}}>
      <h2 style={{color:'#3182ce'}}>طلباتك الحالية</h2>
      {orders.length === 0 && (
        <div style={{
          color:'#fff',
          fontSize:22,
          padding:32,
          background:'linear-gradient(135deg,#38b2ac 10%,#3182ce 100%)',
          borderRadius:18,
          textAlign:'center',
          marginTop:60,
          boxShadow:'0 2px 16px #3182ce33',
          fontWeight:'bold',
          letterSpacing:'1px'
        }}>
          لا توجد طلبات مسجلة لهذا الحساب حتى الآن.
        </div>
      )}
      {orders.length > 0 && (
        <>
          {orders.map(order => {
            let progress = 0;
            let progressColor = '#3182ce';
            let statusLabel = '';
            if (order.status === 'new') { progress = 20; statusLabel = 'جديد'; progressColor = '#a0aec0'; }
            else if (order.status === 'accepted') { progress = 60; statusLabel = 'مقبول'; progressColor = '#38b2ac'; }
            else if (order.status === 'done') { progress = 100; statusLabel = 'تم الإنجاز'; progressColor = '#43a047'; }
            else if (order.status === 'rejected') { progress = 100; statusLabel = 'مرفوض'; progressColor = '#e53e3e'; }
            return (
              <div key={order.id} style={{background:'#fff',borderRadius:12,boxShadow:'0 2px 8px #3182ce22',padding:16,marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',border: order.status==="accepted"?"2px solid #38b2ac":order.status==="rejected"?"2px solid #e53e3e":"2px solid #e2e8f0"}} onClick={()=>setSelected(order)}>
                <div style={{flex:1}}>
                  <b>{order.serviceNames?.join(", ") || order.serviceName || "-"}</b>
                  <div style={{fontSize:13,color:'#666'}}>السعر: {order.basePrice} ج.م</div>
                  <div style={{fontSize:13,color:'#666'}}>مقدم الرعاية: {(order.status === 'accepted' || order.status === 'done') ? (order.providerName || '-') : '-'}</div>
                  <div style={{fontSize:13,color:progressColor,fontWeight:'bold'}}>الحالة: {statusLabel}</div>
                  {/* Progress Bar */}
                  <div style={{background:'#e2e8f0',borderRadius:8,height:10,marginTop:8,overflow:'hidden',maxWidth:220}}>
                    <div style={{width:`${progress}%`,background:progressColor,height:'100%',transition:'width 0.5s'}}></div>
                  </div>
                </div>
                <span style={{color:'#3182ce',fontWeight:700}}>تفاصيل &rarr;</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
export default TrackOrder;