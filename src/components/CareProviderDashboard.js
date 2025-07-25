import React, { useState, useEffect } from "react";
import "./CareProviderDashboard.css";
import AdminPage from "../AdminPage";

import SendNotificationPopup from "./SendNotificationPopup";

export default function CareProviderDashboard({ user, setUser }) {
  const [showProfile, setShowProfile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");
  const [showNotifPopup, setShowNotifPopup] = useState(false);

  // جلب جميع الطلبات المرتبطة بالتخصص الحالي (new) + الطلبات المرتبطة بمقدم الرعاية نفسه (accepted/done/rejected)
  useEffect(() => {
    if (!user) return;
    const specialty = user.providerType || user.specialty || user.role;
    if (!specialty) return;
    // جلب الطلبات الجديدة لهذا التخصص
    fetch(`https://helthend-production.up.railway.app/orders?status=new&specialty=${specialty}`)
      .then(res => res.json())
      .then(newOrders => {
        // جلب الطلبات المرتبطة بمقدم الرعاية نفسه (مقبولة/منجزة/مرفوضة)
        fetch(`https://helthend-production.up.railway.app/orders?providerId=${user.id}`)
          .then(res => res.json())
          .then(myOrders => {
            // دمج الطلبات بدون تكرار
            const allOrders = [...newOrders, ...myOrders.filter(o => !newOrders.some(n => n.id === o.id))];
            setOrders(allOrders);
          });
      });
  }, [user]);

  // تصفية الطلبات حسب الحالة:
  // الطلبات الجديدة: تظهر لكل مقدم رعاية من نفس التخصص
  // الطلبات المقبولة/منجزة/مرفوضة: تظهر فقط إذا كانت تخص مقدم الرعاية الحالي
  const ordersByStatus = (status) => {
    if (status === "new") {
      // الطلبات الجديدة تظهر لكل مقدم رعاية من نفس التخصص فقط إذا لم يتم قبولها
      return orders.filter(o => o.status === "new");
    } else {
      // الطلبات المقبولة/منجزة/مرفوضة تظهر فقط إذا كانت تخص مقدم الرعاية الحالي
      return orders.filter(o => o.status === status && o.providerId === user.id);
    }
  };

  // عدد الخدمات المنجزة (تجريبي)
  const completedCount = ordersByStatus("done").length;

  // دالة لقبول أو رفض الطلب
  function handleOrderAction(orderId, action) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    // عند قبول الطلب، اربطه بمقدم الرعاية
    let patchBody = {};
    if (action === "accept") {
      patchBody = {
        status: "accepted",
        providerId: user.id,
        providerName: user.fullName || user.name,
        providerPhone: user.phone || ""
      };
    } else {
      patchBody = { status: "rejected" };
    }
    fetch(`https://helthend-production.up.railway.app/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody)
    })
      .then(() => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...patchBody } : o));
        setSelectedOrder(null);
        setPopupMsg(action === "accept" ? `تم قبول طلب ${order.patientName} بنجاح` : `تم رفض طلب ${order.patientName}`);
        setTimeout(() => setPopupMsg("") , 2000);
      });
  }

  return (
    <div className="provider-dashboard" style={{background:'linear-gradient(135deg,#e3f6ff 10%,#38b2ac 100%)',minHeight:'100vh',paddingBottom:32}}>
      <header style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:8}}>
          <img src="/user-placeholder.png" alt="صورة مقدم الرعاية" style={{width:54,height:54,borderRadius:'50%',boxShadow:'0 2px 8px #3182ce33',marginLeft:8}} />
          <h2 style={{fontSize:'1.4em',fontWeight:'bold',margin:0,textAlign:'center',color:'#3182ce'}}>مرحباً</h2>
          <span style={{fontSize:'1.4em',fontWeight:'bold',margin:0,textAlign:'center',color:'#232946'}}>{user.fullName || user.name} 👋</span>
        </div>
        <div style={{fontSize:'1.1em',color:'#38b2ac',fontWeight:'bold',marginBottom:8}}>
          <span style={{background:'#e3f6ff',padding:'4px 14px',borderRadius:8,boxShadow:'0 2px 8px #3182ce22'}}>التخصص: {user.providerType}</span>
        </div>
        <button className="logout-btn" style={{marginTop:10}} onClick={() => setUser(null)}>
          تسجيل الخروج
        </button>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          {/* زر بيانات الحساب */}
          <button className="profile-btn" style={{background:'#3182ce',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:'bold',fontSize:'1em',cursor:'pointer'}} onClick={()=>setShowProfile(true)}>
            بيانات الحساب
          </button>
          {/* زر إدارة الأسعار يظهر فقط للأدمن الحقيقي */}
          {user.email === "mario.kabreta@gmail.com" && (
            <button className="admin-access-btn" style={{marginRight: 12}} onClick={() => setShowAdmin(true)}>
              إدارة الأسعار
            </button>
          )}
          {user.isAdmin && (
            <button className="notif-btn" style={{marginRight: 12,background:'#38b2ac',color:'#fff',border:'none',borderRadius:8,padding:'10px 22px',fontWeight:'bold',fontSize:'1em',cursor:'pointer'}} onClick={()=>setShowNotifPopup(true)}>
              إرسال إشعار
            </button>
          )}
        </div>
      </header>
      <div className="provider-profile" style={{textAlign:'center'}}>
        <div style={{display:'flex',justifyContent:'center',gap:24,margin:'12px 0'}}>
          <div style={{background:'#fff',borderRadius:12,padding:'12px 24px',boxShadow:'0 2px 8px #3182ce22',minWidth:120}}>
            <div style={{fontWeight:'bold',color:'#3182ce'}}>عدد الخدمات المنجزة</div>
            <div style={{fontSize:'1.3em',fontWeight:'bold',color:'#43a047'}}>{completedCount}</div>
          </div>
          <div style={{background:'#fff',borderRadius:12,padding:'12px 24px',boxShadow:'0 2px 8px #3182ce22',minWidth:120}}>
            <div style={{fontWeight:'bold',color:'#3182ce'}}>اسم مقدم الرعاية</div>
            <div style={{fontSize:'1.1em',fontWeight:'bold',color:'#232946'}}>{user.fullName || user.name}</div>
          </div>
        </div>
      </div>
      <div className="provider-content">
        <div className="provider-card" style={{background:'#fff',borderRadius:14,boxShadow:'0 2px 8px #3182ce22',marginBottom:18,padding:'18px 16px'}}>
          <h3 style={{color:'#3182ce',marginBottom:12}}>الطلبات الجديدة</h3>
          <div className="orders-list">
            {ordersByStatus("new").length === 0 && <div className="empty-state">لا توجد طلبات جديدة</div>}
            {ordersByStatus("new").map((order) => (
              <div key={order.id} className="order-item" style={{background:'#e3f6ff',borderRadius:8,padding:'10px 14px',marginBottom:8,cursor:'pointer',boxShadow:'0 2px 8px #3182ce11'}} onClick={() => setSelectedOrder(order)}>
                <b style={{color:'#232946'}}>{order.patientName}</b> - <span style={{color:'#3182ce'}}>{order.serviceNames ? order.serviceNames.join(", ") : order.service}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="provider-card">
          <h3 style={{color:'#43a047',marginBottom:12}}>الطلبات المقبولة (لم يتم إنجازها)</h3>
          <div className="orders-list">
            {ordersByStatus("accepted").length === 0 && <div className="empty-state">لا توجد طلبات</div>}
            {ordersByStatus("accepted").map((order) => (
              <div key={order.id} className="order-item" style={{background:'#e6ffed',borderRadius:8,padding:'10px 14px',marginBottom:8,boxShadow:'0 2px 8px #43a04711'}}>
                <b style={{color:'#232946'}}>{order.patientName}</b> - <span style={{color:'#43a047'}}>{order.serviceNames ? order.serviceNames.join(", ") : order.service}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="provider-card">
          <h3 style={{color:'#3182ce',marginBottom:12}}>الطلبات المنجزة</h3>
          <div className="orders-list">
            {ordersByStatus("done").length === 0 && <div className="empty-state">لا توجد طلبات</div>}
            {ordersByStatus("done").map((order) => (
              <div key={order.id} className="order-item" style={{background:'#e3f6ff',borderRadius:8,padding:'10px 14px',marginBottom:8,boxShadow:'0 2px 8px #3182ce11'}}>
                <b style={{color:'#232946'}}>{order.patientName}</b> - <span style={{color:'#3182ce'}}>{order.serviceNames ? order.serviceNames.join(", ") : order.service}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="provider-card">
          <h3 style={{color:'#e53e3e',marginBottom:12}}>الطلبات المرفوضة</h3>
          <div className="orders-list">
            {ordersByStatus("rejected").length === 0 && <div className="empty-state">لا توجد طلبات</div>}
            {ordersByStatus("rejected").map((order) => (
              <div key={order.id} className="order-item" style={{background:'#ffe6e6',borderRadius:8,padding:'10px 14px',marginBottom:8,boxShadow:'0 2px 8px #e53e3e11'}}>
                <b style={{color:'#232946'}}>{order.patientName}</b> - <span style={{color:'#e53e3e'}}>{order.serviceNames ? order.serviceNames.join(", ") : order.service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popup تفاصيل الطلب */}
      {selectedOrder && (
        <div className="order-popup-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-popup" onClick={e => e.stopPropagation()} style={{background:'#f7fafc',borderRadius:16,padding:'24px 18px',boxShadow:'0 2px 16px #3182ce22',maxWidth:420}}>
            <h3 style={{color:'#3182ce',marginBottom:12}}>تفاصيل الطلب</h3>
            <div style={{marginBottom:8}}><b>اسم المريض:</b> <span style={{color:'#232946'}}>{selectedOrder.patientName}</span></div>
            <div style={{marginBottom:8}}><b>العنوان:</b> <span style={{color:'#232946'}}>{selectedOrder.address}</span></div>
            <div style={{marginBottom:8}}><b>الخدمات المطلوبة:</b> <span style={{color:'#3182ce'}}>{selectedOrder.serviceNames ? selectedOrder.serviceNames.join(", ") : selectedOrder.service}</span></div>
            <div style={{marginBottom:8}}><b>السعر الأساسي:</b> <span style={{color:'#232946'}}>{selectedOrder.basePrice} ج.م</span></div>
            <div style={{marginBottom:8}}><b>السعر المقترح من المريض:</b> <span style={{color:'#232946'}}>{selectedOrder.suggestedPrice} ج.م</span></div>
            {/* عرض المرفقات/التقارير */}
            {selectedOrder.attachments && selectedOrder.attachments.length > 0 && (
              <div style={{marginBottom:8}}>
                <b>المرفقات/التقارير:</b>
                <ul style={{paddingRight:18}}>
                  {selectedOrder.attachments.map((f,i) => (
                    <li key={i} style={{color:'#3182ce',fontWeight:'bold'}}>
                      <span role="img" aria-label="مرفق">📎</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{margin: "10px 0"}}>
              <iframe
                title="خريطة المريض"
                width="100%"
                height="180"
                style={{ borderRadius: "12px" }}
                frameBorder="0"
                src={`https://maps.google.com/maps?q=${selectedOrder.location.lat},${selectedOrder.location.lng}&z=15&output=embed`}
                allowFullScreen
              ></iframe>
              <button
                style={{marginTop:10,background:'#3182ce',color:'#fff',padding:'8px 18px',border:'none',borderRadius:8,fontWeight:'bold',fontSize:'1em',cursor:'pointer'}}
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async pos => {
                      const lat = pos.coords.latitude;
                      const lng = pos.coords.longitude;
                      // حفظ موقع مقدم الرعاية في الطلب
                      await fetch(`https://helthend-production.up.railway.app/orders/${selectedOrder.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ providerLocation: { lat, lng } })
                      });
                      alert('تم مشاركة موقعك بنجاح!');
                    }, err => {
                      alert('تعذر تحديد موقعك. يرجى السماح بالوصول للموقع.');
                    });
                  } else {
                    alert('المتصفح لا يدعم تحديد الموقع الجغرافي.');
                  }
                }}
              >مشاركة موقعي الحالي</button>
            </div>
            <div style={{display: "flex", gap: 10, marginTop: 10,justifyContent:'center'}}>
              {selectedOrder.status === "new" && <>
                <button className="accept-btn" style={{background:'#43a047',color:'#fff',padding:'8px 18px',border:'none',borderRadius:8,fontWeight:'bold',fontSize:'1em',cursor:'pointer'}} onClick={() => handleOrderAction(selectedOrder.id, "accept")}>قبول الطلب</button>
                <button className="reject-btn" style={{background:'#e53e3e',color:'#fff',padding:'8px 18px',border:'none',borderRadius:8,fontWeight:'bold',fontSize:'1em',cursor:'pointer'}} onClick={() => handleOrderAction(selectedOrder.id, "reject")}>رفض الطلب</button>
              </>}
              {selectedOrder.status === "accepted" && (
                <span style={{color:'#43a047',fontWeight:'bold',fontSize:'1.1em'}}>في انتظار إتمام الخدمة من المريض</span>
              )}
              {selectedOrder.status === "done" && (
                <span style={{color:'#43a047',fontWeight:'bold',fontSize:'1.1em'}}>تم تنفيذ الطلب بنجاح</span>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Popup رسالة قبول/رفض */}
      {popupMsg && (
        <div className="provider-popup-msg">{popupMsg}</div>
      )}
      {/* إدارة الأسعار */}
      {showAdmin && (
        <div className="order-popup-overlay" onClick={() => setShowAdmin(false)}>
          <div className="order-popup" onClick={e => e.stopPropagation()}>
            <AdminPage />
            <button className="close-popup-btn" onClick={() => setShowAdmin(false)}>إغلاق</button>
          </div>
        </div>
      )}
      {/* نافذة بيانات الحساب */}
      {showProfile && (
        <div className="order-popup-overlay" onClick={() => setShowProfile(false)}>
          <div className="order-popup" onClick={e => e.stopPropagation()}>
            {/* تحقق من وجود بيانات المستخدم */}
            <div style={{maxWidth:420}}>
              {user
                ? <Profile user={user} />
                : <div style={{color:'red',fontWeight:'bold',padding:'24px'}}>لا توجد بيانات مستخدم لعرضها.</div>
              }
            </div>
            <button className="close-popup-btn" onClick={() => setShowProfile(false)}>إغلاق</button>
          </div>
        </div>
      )}
      {/* نافذة إرسال إشعار */}
      {showNotifPopup && (
        <SendNotificationPopup onClose={()=>setShowNotifPopup(false)} />
      )}
    </div>
  );
}