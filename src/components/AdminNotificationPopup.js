import React, { useState } from "react";
import "./AdminNotificationPopup.css";

export default function AdminNotificationPopup({ onSend, onClose }) {
  const [message, setMessage] = useState("");
  const [toPatient, setToPatient] = useState(false);
  const [toProvider, setToProvider] = useState(false);
  const [showOnce, setShowOnce] = useState(true);

  return (
    <div className="admin-notification-popup-overlay">
      <div className="admin-notification-popup-card">
        <h3>إرسال إشعار للمستخدمين</h3>
        <textarea
          className="admin-notification-textarea"
          placeholder="اكتب نص الإشعار هنا..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <div className="admin-notification-options">
          <label>
            <input type="checkbox" checked={toPatient} onChange={e => setToPatient(e.target.checked)} />
            للمرضى فقط
          </label>
          <label>
            <input type="checkbox" checked={toProvider} onChange={e => setToProvider(e.target.checked)} />
            لمقدمي الرعاية فقط
          </label>
        </div>
        <div className="admin-notification-options">
          <label>
            <input type="checkbox" checked={showOnce} onChange={e => setShowOnce(e.target.checked)} />
            يظهر مرة واحدة فقط
          </label>
        </div>
        <div style={{marginTop:16,display:'flex',gap:10,justifyContent:'center'}}>
          <button className="admin-notification-send-btn" onClick={() => onSend({ message, toPatient, toProvider, showOnce })} disabled={!message || (!toPatient && !toProvider)}>
            إرسال الإشعار
          </button>
          <button className="admin-notification-cancel-btn" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
