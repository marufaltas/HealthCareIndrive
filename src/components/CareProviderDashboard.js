import React, { useState, useEffect } from "react";
import "./CareProviderDashboard.css";
import AdminPage from "../AdminPage";

export default function CareProviderDashboard({ user, setUser }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  // جلب الطلبات من db.json
  useEffect(() => {
    // جلب الطلبات المخصصة لهذا المقدم فقط (providerId)
    fetch(`http://localhost:5000/orders?providerId=${user.id}`)
      .then(res => res.json())
      .then(setOrders);
  }, [user.id]);

  // تصفية الطلبات حسب الحالة
  const ordersByStatus = (status) =>
    orders.filter((o) => o.status === status);

  // عدد الخدمات المنجزة (تجريبي)
  const completedCount = ordersByStatus("done").length;

  // دالة لقبول أو رفض الطلب
  function handleOrderAction(orderId, action) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    // تحديث الطلب في قاعدة البيانات
    fetch(`http://localhost:5000/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action === "accept" ? "accepted" : "rejected" })
    })
      .then(() => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: action === "accept" ? "accepted" : "rejected" } : o));
        setSelectedOrder(null);
        setPopupMsg(action === "accept" ? `تم قبول طلب ${order.patientName} بنجاح` : `تم رفض طلب ${order.patientName}`);
        setTimeout(() => setPopupMsg(""), 2000);
      });
  }

  return (
    <div className="provider-dashboard">
      <header>
        <h2>مرحباً {user.fullName || user.name} 👋</h2>
        <button className="logout-btn" onClick={() => setUser(null)}>
          تسجيل الخروج
        </button>
        <button className="admin-access-btn" style={{marginRight: 12}} onClick={() => setShowAdmin(true)}>
          إدارة الأسعار
        </button>
      </header>
      <div className="provider-profile">
        <div>
          <b>التخصص:</b> {user.providerType}
        </div>
        <div>
          <b>الاسم:</b> {user.fullName || user.name}
        </div>
        <div>
          <b>عدد الخدمات المنجزة:</b> {completedCount}
        </div>
      </div>
      <div className="provider-content">
        <div className="provider-card" onClick={() => {}}>
          <h3>الطلبات الجديدة</h3>
          <div className="orders-list">
            {ordersByStatus("new").length === 0 && <div className="empty-state">لا توجد طلبات جديدة</div>}
            {ordersByStatus("new").map((order) => (
              <div key={order.id} className="order-item" onClick={() => setSelectedOrder(order)}>
                <b>{order.patientName}</b> - {order.serviceNames ? order.serviceNames.join(", ") : order.service}
              </div>
            ))}
          </div>
        </div>
        <div className="provider-card">
          <h3>الطلبات المقبولة (لم يتم إنجازها)</h3>
          <div className="orders-list">
            {ordersByStatus("accepted").length === 0 && <div className="empty-state">لا توجد طلبات</div>}
            {ordersByStatus("accepted").map((order) => (
              <div key={order.id} className="order-item">
                <b>{order.patientName}</b> - {order.serviceNames ? order.serviceNames.join(", ") : order.service}
              </div>
            ))}
          </div>
        </div>
        <div className="provider-card">
          <h3>الطلبات المقبولة (تم إنجازها)</h3>
          <div className="orders-list">
            {ordersByStatus("done").length === 0 && <div className="empty-state">لا توجد طلبات</div>}
            {ordersByStatus("done").map((order) => (
              <div key={order.id} className="order-item">
                <b>{order.patientName}</b> - {order.serviceNames ? order.serviceNames.join(", ") : order.service}
              </div>
            ))}
          </div>
        </div>
        <div className="provider-card">
          <h3>الطلبات المرفوضة</h3>
          <div className="orders-list">
            {ordersByStatus("rejected").length === 0 && <div className="empty-state">لا توجد طلبات</div>}
            {ordersByStatus("rejected").map((order) => (
              <div key={order.id} className="order-item">
                <b>{order.patientName}</b> - {order.serviceNames ? order.serviceNames.join(", ") : order.service}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popup تفاصيل الطلب */}
      {selectedOrder && (
        <div className="order-popup-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-popup" onClick={e => e.stopPropagation()}>
            <h3>تفاصيل الطلب</h3>
            <div><b>اسم المريض:</b> {selectedOrder.patientName}</div>
            <div><b>العنوان:</b> {selectedOrder.address}</div>
            <div><b>الخدمات المطلوبة:</b> {selectedOrder.serviceNames ? selectedOrder.serviceNames.join(", ") : selectedOrder.service}</div>
            <div><b>السعر الأساسي:</b> {selectedOrder.basePrice} ج.م</div>
            <div><b>السعر المقترح من المريض:</b> {selectedOrder.suggestedPrice} ج.م</div>
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
            </div>
            <div style={{display: "flex", gap: 10, marginTop: 10}}>
              {selectedOrder.status === "new" && <>
                <button className="accept-btn" onClick={() => handleOrderAction(selectedOrder.id, "accept")}>قبول الطلب</button>
                <button className="reject-btn" onClick={() => handleOrderAction(selectedOrder.id, "reject")}>رفض الطلب</button>
              </>}
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
    </div>
  );
}