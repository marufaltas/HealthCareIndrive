import React, { useState } from "react";
import "./SendNotificationPopup.css";

export default function SendNotificationPopup({ onClose }) {
  const [message, setMessage] = useState("");
  const [toPatient, setToPatient] = useState(false);
  const [toProvider, setToProvider] = useState(false);
  const [showOnce, setShowOnce] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSend() {
    setSending(true);
    // هنا يتم حفظ الإشعار في قاعدة البيانات أو إرساله (تجريبي)
    setTimeout(() => {
      setSending(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  }

  return (
    <div className="send-notif-popup-overlay">
      <div className="send-notif-popup-card">
        <h3>إرسال إشعار للمستخدمين</h3>
        <textarea
          className="notif-textarea"
          placeholder="اكتب نص الإشعار هنا..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
        />
        <div className="notif-checkbox-row">
          <label>
            <input type="checkbox" checked={toPatient} onChange={e => setToPatient(e.target.checked)} />
            للمريض فقط
          </label>
          <label>
            <input type="checkbox" checked={toProvider} onChange={e => setToProvider(e.target.checked)} />
            لمقدمي الرعاية الصحية
          </label>
        </div>
        <div className="notif-checkbox-row">
          <label>
            <input type="checkbox" checked={showOnce} onChange={e => setShowOnce(e.target.checked)} />
            يظهر مرة واحدة فقط
          </label>
          <label>
            <input type="checkbox" checked={!showOnce} onChange={e => setShowOnce(!e.target.checked)} />
            يظهر دائماً عند الدخول
          </label>
        </div>
        <button className="notif-send-btn" onClick={handleSend} disabled={sending || !message || (!toPatient && !toProvider)}>
          {sending ? "جاري الإرسال..." : "إرسال الإشعار"}
        </button>
        <button className="notif-close-btn" onClick={onClose}>إغلاق</button>
        {success && <div className="notif-success-msg">تم إرسال الإشعار بنجاح!</div>}
      </div>
    </div>
  );
}
