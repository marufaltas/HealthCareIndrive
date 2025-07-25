import React, { useState, useEffect } from "react";
import "./SendNotificationPopup.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://helthend-production.up.railway.app";

// تخصصات مقدمي الرعاية
const providerSpecialties = [
  { key: "nurse", label: "ممرض" },
  { key: "doctor", label: "طبيب" },
  { key: "physio", label: "علاج طبيعي" },
  { key: "pharmacist", label: "صيدلي" },
  { key: "lab", label: "فني تحاليل" },
  { key: "xray", label: "فني أشعة" },
  { key: "nutrition", label: "استشاري تغذية" },
  { key: "psychology", label: "علاج نفسي" },
  { key: "babycare", label: "تمريض حديثي الولادة" }
];

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

  // تخصصات مختارة عند اختيار كل مقدمي الرعاية الصحية
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/notifications?_sort=createdAt&_order=desc`)
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

    // تحديد الفئة المستهدفة حسب الاختيار
    let targetType = "";
    let targetSpecialties = [];
    if (toPatient && !toProvider) {
      targetType = "patient";
    } else if (!toPatient && toProvider) {
      targetType = "provider";
      targetSpecialties = selectedSpecialties;
    } else if (toPatient && toProvider) {
      targetType = "all";
      targetSpecialties = selectedSpecialties;
    } else {
      targetType = "";
    }

    if (!targetType) {
      setSending(false);
      setError("يجب اختيار الفئة المستهدفة (مريض أو مقدم رعاية)");
      return;
    }
    if (toProvider && selectedSpecialties.length === 0) {
      setSending(false);
      setError("يرجى اختيار تخصص واحد على الأقل من مقدمي الرعاية الصحية");
      return;
    }

    // بناء جسم الإشعار حسب ما يقبله json-server
    const notifBody = {
      body: fullMsg,
      title: "إشعار جديد",
      targetType,
      specialties: targetSpecialties, // تخصصات مختارة
      active: true,
      showAsPopup: !showOnce ? true : false, // إذا كان showOnce=false يظهر دائماً
      showOnce: !!showOnce,
      createdAt: new Date().toISOString()
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
            لكل المرضى
          </label>
          <label>
            <input type="checkbox" checked={toProvider} onChange={e => setToProvider(e.target.checked)} />
            لكل مقدمي الرعاية الصحية
          </label>
        </div>
        {/* اختيار تخصصات مقدمي الرعاية إذا تم اختيارهم */}
        {toProvider && (
          <div style={{margin:'10px 0',textAlign:'right'}}>
            <b style={{color:'#3182ce'}}>اختر التخصصات المستهدفة:</b>
            <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:8}}>
              {providerSpecialties.map(s => (
                <label key={s.key} style={{background:'#e3f6ff',padding:'6px 14px',borderRadius:8,cursor:'pointer',fontWeight:'bold',color:'#215175'}}>
                  <input
                    type="checkbox"
                    checked={selectedSpecialties.includes(s.key)}
                    onChange={e => {
                      setSelectedSpecialties(prev =>
                        e.target.checked
                          ? [...prev, s.key]
                          : prev.filter(k => k !== s.key)
                      );
                    }}
                    style={{marginLeft:6}}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        )}
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
              <b>{n.body}</b>
              <div style={{fontSize:'0.9em',color:'#888'}}>بتاريخ: {new Date(n.createdAt).toLocaleString()} | الفئة: {n.targetType} {n.specialties && n.specialties.length > 0 ? `| تخصصات: ${n.specialties.join(", ")}` : ""}</div>
              <button onClick={()=>handleDeleteNotif(n.id)} style={{position:'absolute',top:8,left:8,background:'#e53e3e',color:'#fff',border:'none',borderRadius:6,padding:'2px 10px',fontWeight:'bold',cursor:'pointer'}}>حذف</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SendNotificationPopup;

