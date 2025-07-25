import React, { useState, useEffect } from "react";
import "./SendNotificationPopup.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://helthend-production.up.railway.app";

function SendNotificationPopup({ onClose }) {
  const [message, setMessage] = useState("");
  const [toPatient, setToPatient] = useState(false);
  const [toProvider, setToProvider] = useState(false);
  const [showOnce, setShowOnce] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notifLink, setNotifLink] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/notifications?_sort=date&_order=desc`)
      .then(res => res.json())
      .then(setNotifications);
  }, []);

  function handleSend() {
    setSending(true);
    setError(null);
    let fullMsg = message;
    if (notifLink) {
      fullMsg += ` [رابط](${notifLink})`;
    }
    const targets = [];
    if (toPatient) targets.push("patients");
    if (toProvider) targets.push("providers");
    const notifBody = {
      message: fullMsg,
      target: targets.join(","),
      date: new Date().toISOString(),
      showOnce
    };
    fetch(`${API_BASE}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notifBody)
    })
      .then(res => {
        if (!res.ok) throw new Error("فشل إرسال الإشعار. تحقق من الاتصال بالسيرفر أو من صحة البيانات.");
        return res.json();
      })
      .then(newNotif => {
        setSending(false);
        setSuccess(true);
        // إذا لم يرجع السيرفر id أضف الإشعار يدوياً
        if (!newNotif.id) {
          newNotif = { ...notifBody, id: Math.random().toString(36).slice(2) };
        }
        setNotifications(prev => [newNotif, ...prev]);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      })
      .catch(err => {
        setSending(false);
        setError(err.message || "حدث خطأ أثناء إرسال الإشعار.");
      });
  }

  function handleDeleteNotif(id) {
    fetch(`${API_BASE}/notifications/${id}`, { method: 'DELETE' })
      .then(() => setNotifications(notifications.filter(n => n.id !== id)));
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
        <input
          className="notif-link-input"
          placeholder="رابط (اختياري) مثال: https://..."
          value={notifLink}
          onChange={e => setNotifLink(e.target.value)}
          style={{width:'100%',margin:'8px 0'}}
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
        {error && <div style={{color:'red',margin:'10px 0',fontWeight:'bold'}}>{error}</div>}
        {success && <div className="notif-success-msg">تم إرسال الإشعار بنجاح!</div>}
        <hr style={{margin:'18px 0'}}/>
        <h4 style={{margin:'8px 0'}}>كل الإشعارات المرسلة</h4>
        <div style={{maxHeight:180,overflowY:'auto'}}>
          {notifications.length === 0 ? <div>لا توجد إشعارات</div> : notifications.map(n => (
            <div key={n.id} style={{background:'#e3f6ff',borderRadius:8,padding:10,marginBottom:8,position:'relative'}}>
              <b>{n.message}</b>
              <div style={{fontSize:'0.9em',color:'#888'}}>بتاريخ: {new Date(n.date).toLocaleString()} | الفئة: {n.target}</div>
              <button onClick={()=>handleDeleteNotif(n.id)} style={{position:'absolute',top:8,left:8,background:'#e53e3e',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',fontWeight:'bold',cursor:'pointer'}}>حذف</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SendNotificationPopup;
