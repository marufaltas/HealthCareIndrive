import React from "react";
import "./ErrorPopup.css";

export default function ErrorPopup({ message, onClose, recoverLink }) {
  return (
    <div className="error-popup-overlay">
      <div className="error-popup-card">
        <div className="error-popup-icon">❌</div>
        <div className="error-popup-message">{message}</div>
        <div className="error-popup-recover">
          <span>هل تعتقد أنك نسيت بيانات تسجيل الدخول؟ </span>
          <a href={recoverLink} target="_blank" rel="noopener noreferrer">استعادة كلمة المرور</a>
        </div>
        <button className="error-popup-close" onClick={onClose}>إغلاق</button>
      </div>
    </div>
  );
}
