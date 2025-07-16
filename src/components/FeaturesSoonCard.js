import React, { useState } from "react";
import "./FeaturesSoonCard.css";

const features = [
  "تتبع حي لمقدم الخدمة على الخريطة",
  "دفع إلكتروني آمن",
  "تقييم مقدم الخدمة بعد انتهاء الطلب",
  "إشعارات فورية لحالة الطلب",
  "دعم الدردشة مع مقدم الخدمة",
  "عروض وخصومات موسمية",
  "إضافة أفراد العائلة وإدارة حساباتهم"
];

export default function FeaturesSoonCard() {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <>
      <div className="features-soon-card" onClick={() => setShowPopup(true)}>
        <span className="soon-icon">🚀</span>
        <div>
          <b>مميزات سيتم إضافتها قريباً</b>
          <div className="soon-desc">اضغط لعرض التفاصيل</div>
        </div>
      </div>
      {showPopup && (
        <div className="features-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="features-popup" onClick={e => e.stopPropagation()}>
            <h3>مميزات قادمة قريباً</h3>
            <ul className="features-list">
              {features.map(f => (
                <li key={f}><span className="check-icon">✔</span> {f}</li>
              ))}
            </ul>
            <button className="close-popup-btn" onClick={() => setShowPopup(false)}>إغلاق</button>
          </div>
        </div>
      )}
    </>
  );
}
