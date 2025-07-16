import React, { useEffect } from "react";
import FallingIcons from "./FallingIcons";
import "./OrderPendingPopup.css";

export default function OrderPendingPopup({ order, onClose, autoClose = true, delay = 4000 }) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, delay, onClose]);

  if (!order) return null;

  return (
    <div className="order-pending-popup-overlay">
      <FallingIcons />
      <div className="order-pending-popup-card order-pending-popup-card-welcome">
        <div className="order-pending-logo-circle">
          <img src="/wight.png" alt="شعار الموقع" />
        </div>
        <h1 className="order-pending-welcome-title">أهلاً بيك في <span style={{ color: "#38b2ac" }}>HealthCare InDrive</span> للرعاية الصحية</h1>
        <div className="order-pending-loader"></div>
        <h3>تم إرسال طلبك بنجاح!</h3>
        <p>جاري البحث عن مقدم رعاية مناسب لطلبك...</p>
        <div className="order-pending-info">
          <div><b>الخدمات المطلوبة:</b> {order.serviceNames?.join(", ") || order.service || "-"}</div>
          <div><b>العنوان:</b> {order.address || "-"}</div>
          <div><b>السعر الأساسي:</b> {order.basePrice} ج.م</div>
          <div><b>السعر المقترح:</b> {order.suggestedPrice || "-"} ج.م</div>
        </div>
        <p className="order-pending-hint">سيتم تحويلك تلقائيًا إلى صفحة تتبع الطلب خلال ثوانٍ...</p>
        <button className="close-popup-btn" onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
