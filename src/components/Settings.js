import React, { useState } from "react";
import "./Settings.css";

export default function Settings({ setUser, user }) {
  const [showAccount, setShowAccount] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [editData, setEditData] = useState({ address: user?.address || "", age: user?.age || "" });
  const [saving, setSaving] = useState(false);
  // إعدادات التطبيق
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [invertColors, setInvertColors] = useState(false);

  // تطبيق إعدادات الخط والوضع الليلي والعكس
  React.useEffect(() => {
    document.body.style.fontSize = fontSize + "px";
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("invert-colors", invertColors);
  }, [fontSize, darkMode, invertColors]);

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
        <li>الإحصائيات</li>
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
            <div>
              <label>الوضع الليلي:</label>
              <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
            </div>
            <div>
              <label>عكس الألوان (لضعاف البصر):</label>
              <input type="checkbox" checked={invertColors} onChange={e => setInvertColors(e.target.checked)} />
            </div>
            <button type="button" onClick={() => setShowAppSettings(false)} className="close-popup-btn">إغلاق</button>
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