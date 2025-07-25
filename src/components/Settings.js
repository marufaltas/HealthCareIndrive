import React, { useState } from "react";
import "./Settings.css";
import { useTheme } from "./ThemeContext";

export default function Settings({ setUser, user }) {
  const [showAccount, setShowAccount] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [editData, setEditData] = useState({ address: user?.address || "", age: user?.age || "" });
  const [saving, setSaving] = useState(false);
  // إعدادات التطبيق
  const [fontSize, setFontSize] = useState(16);
  // الوضع الليلي: جلب من localStorage إذا كان مفعل مسبقاً
  const { dark, setDark } = useTheme();
  const [invertColors, setInvertColors] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // جلب الطلبات لهذا المستخدم
  const [orders, setOrders] = useState([]);
  React.useEffect(() => {
    if (!user) return;
    fetch(`https://helthend-production.up.railway.app/orders?patientId=${user.id}`)
      .then(res => res.json())
      .then(setOrders);
  }, [user]);

  // حساب الإحصائيات
  const doneCount = orders.filter(o => o.status === "done").length;
  const rejectedCount = orders.filter(o => o.status === "rejected").length;
  const incompleteCount = orders.filter(o => o.status !== "done" && o.status !== "rejected").length;

  // تطبيق إعدادات الخط والوضع الليلي والعكس
  React.useEffect(() => {
    document.body.style.fontSize = fontSize + "px";
    if (dark) {
      document.body.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      document.body.removeAttribute('data-theme');
      document.body.classList.remove('dark');
    }
    document.body.classList.toggle("invert-colors", invertColors);
  }, [fontSize, dark, invertColors]);

  function handleLogout() {
    setUser(null);
    window.location.reload();
  }

  function handleSaveAccount(e) {
    e.preventDefault();
    setSaving(true);
    // تحديث البيانات في قاعدة البيانات (يفترض وجود endpoint مناسب)
    fetch(`https://helthend-production.up.railway.app/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: editData.address, age: editData.age }),
    })
      .then(() => {
        setSaving(false);
        setShowAccount(false);
        setUser({ ...user, address: editData.address, age: editData.age });
      });
  }

  return (
    <div className="settings-main">
      <h2>الإعدادات</h2>
      <ul>
        <li onClick={() => setShowAccount(true)}>إعدادات الحساب</li>
        <li onClick={() => setShowAppSettings(true)}>إعدادات التطبيق</li>
        <li onClick={() => setShowStats(true)}>الإحصائيات</li>
        <li onClick={handleLogout} style={{ color: "#e53e3e", fontWeight: "bold" }}>تسجيل الخروج</li>
        <li onClick={() => setShowAbout(true)} style={{ color: "gold", fontWeight: "bold", fontSize: "1.1em" }}>عن المطور ⭐</li>
      </ul>

      {/* Popup إعدادات الحساب */}
      {showAccount && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>بيانات الحساب</h3>
            <form onSubmit={handleSaveAccount}>
              <div>الاسم: <b>{user.fullName}</b></div>
              <div>البريد الإلكتروني: <b>{user.email}</b></div>
              <div>رقم الهاتف: <b>{user.phone}</b></div>
              <div>
                العنوان:
                <input type="text" value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} />
              </div>
              <div>
                العمر:
                <input type="number" value={editData.age} onChange={e => setEditData({ ...editData, age: e.target.value })} />
              </div>
              <button type="submit" disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
              <button type="button" onClick={() => setShowAccount(false)} className="close-popup-btn">إغلاق</button>
            </form>
          </div>
        </div>
      )}

      {/* Popup إعدادات التطبيق */}
      {showAppSettings && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>إعدادات التطبيق</h3>
            <div>
              <label>حجم الخط:</label>
              <input type="range" min="12" max="28" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} />
              <span style={{ marginRight: 8 }}>{fontSize}px</span>
            </div>
            <div style={{marginTop:12}}>
              <label htmlFor="darkModeToggle" style={{marginLeft:8}}>الوضع الليلي:</label>
              <button
                id="darkModeToggle"
                className="theme-toggle-btn"
                style={{background:dark?'#232946':'#e2e8f0',color:dark?'#e3f6ff':'#232946',border:'1px solid #38b2ac',borderRadius:8,padding:'8px 18px',fontWeight:'bold',fontSize:'1em',cursor:'pointer',marginRight:8}}
                onClick={()=>setDark(d=>!d)}
              >{dark ? 'وضع النهار' : 'وضع الليل'}</button>
            </div>
            <div style={{marginTop:12}}>
              <label>عكس الألوان (لضعاف البصر):</label>
              <input type="checkbox" checked={invertColors} onChange={e => setInvertColors(e.target.checked)} />
            </div>
            <button type="button" onClick={() => setShowAppSettings(false)} className="close-popup-btn">إغلاق</button>
          </div>
        </div>
      )}

      {/* Popup الإحصائيات */}
      {showStats && (
        <div className="popup-overlay">
          <div className="popup-card" style={{maxWidth:420}}>
            <h3 style={{textAlign:'center',marginBottom:18,color:'#3182ce'}}>إحصائيات حسابك</h3>
            <div style={{display:'flex',gap:18,justifyContent:'center',flexWrap:'wrap'}}>
              <div style={{
                background:'linear-gradient(135deg,#43a047 60%,#38b2ac 100%)',
                color:'#fff',
                borderRadius:14,
                boxShadow:'0 2px 12px #43a04755',
                padding:'22px 18px',
                minWidth:120,
                textAlign:'center',
                fontWeight:'bold',
                fontSize:'1.15em'
              }}>
                الخدمات المنجزة<br/>
                <span style={{fontSize:'2em',color:'#ffd700'}}>{doneCount}</span>
              </div>
              <div style={{
                background:'linear-gradient(135deg,#e53e3e 60%,#f56565 100%)',
                color:'#fff',
                borderRadius:14,
                boxShadow:'0 2px 12px #e53e3e55',
                padding:'22px 18px',
                minWidth:120,
                textAlign:'center',
                fontWeight:'bold',
                fontSize:'1.15em'
              }}>
                الخدمات المرفوضة<br/>
                <span style={{fontSize:'2em',color:'#fff'}}>{rejectedCount}</span>
              </div>
              <div style={{
                background:'linear-gradient(135deg,#3182ce 60%,#b8b8b8 100%)',
                color:'#fff',
                borderRadius:14,
                boxShadow:'0 2px 12px #3182ce55',
                padding:'22px 18px',
                minWidth:120,
                textAlign:'center',
                fontWeight:'bold',
                fontSize:'1.15em'
              }}>
                الخدمات الغير مكتملة<br/>
                <span style={{fontSize:'2em',color:'#fff'}}>{incompleteCount}</span>
              </div>
            </div>
            <button type="button" onClick={() => setShowStats(false)} className="close-popup-btn" style={{marginTop:18}}>إغلاق</button>
          </div>
        </div>
      )}

      {/* Popup عن المطور */}
      {showAbout && (
        <div className="about-popup-overlay">
          <div className="about-popup-card">
            <div className="about-stars-bg"></div>
            <div className="about-content">
              <div style={{ color: "gold", fontWeight: "bold", fontSize: "1.2em", marginBottom: 8 }}>
                تم تطوير هذا التطبيق بواسطة
                <span style={{ margin: "0 8px", color: "#fff", fontWeight: "bold", fontSize: "1.2em" }}>Dr-MaruFaltas</span>
                <span className="verified-badge">✔</span>
              </div>
              <div style={{ color: "#fff", fontWeight: "bold", fontSize: "1.1em", marginBottom: 8 }}>
                للتواصل :
                <a href="https://wa.me/201284731863" target="_blank" rel="noopener noreferrer" style={{ color: "#ffd700", marginRight: 8, textDecoration: "underline" }}>
                  01284731863
                </a>
              </div>
              <button type="button" onClick={() => setShowAbout(false)} className="close-popup-btn">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}