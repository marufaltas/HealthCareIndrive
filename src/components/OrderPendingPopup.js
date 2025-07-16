import React, { useEffect } from "react";
import "./OrderPendingPopup.css";

export default function OrderPendingPopup({ order, onClose, autoClose = true, delay = 5000 }) {
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
      <div className="order-pending-popup-card">
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
