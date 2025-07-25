import React, { useState, useEffect } from "react";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import Navbar from "./components/Navbar";
import FallingIcons from "./components/FallingIcons";
import Profile from "./components/Profile";
import OrderNow from "./components/OrderNow";
import TrackOrder from "./components/TrackOrder";
import Settings from "./components/Settings";
import LoginRegister from "./components/LoginRegister";
import CareProviderDashboard from "./components/CareProviderDashboard";
import AdminPage from "./AdminPage";
import AdminServicesPage from "./AdminServicesPage";
import "./App.css";

// استخدم هذا المتغير في كل fetch بدلاً من كتابة الرابط مباشرة
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://helthend-production.up.railway.app";

function GlobalNotificationPopup({ user }) {
  const [notification, setNotification] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    // تحقق من أن الإشعار لم يتم تجاهله مسبقاً
    const ignored = localStorage.getItem("ignoredNotifId");
    fetch(`${API_BASE}/notifications?target=${user.type === 'patient' ? 'patients' : 'providers'}&_sort=date&_order=desc&_limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0 && data[0].id !== ignored) {
          setNotification(data[0]);
          setShow(true);
        }
      });
  }, [user]);

  if (!notification || !show) return null;

  function handleIgnore() {
    localStorage.setItem("ignoredNotifId", notification.id);
    setShow(false);
  }

  // دعم الروابط في نص الإشعار (مثال: [رابط](https://example.com))
  function renderMessage(msg) {
    if (!msg || typeof msg !== "string") return null;
    return msg.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer" style={{color:'#3182ce',textDecoration:'underline'}}>{match[1]}</a>;
      }
      return part;
    });
  }

  // دعم body إذا لم يوجد message
  const notifText = notification.message || notification.body || "";

  return (
    <div className="popup-overlay" style={{zIndex: 10000}}>
      <div className="popup-card" style={{maxWidth:400,position:'relative'}}>
        <button onClick={()=>setShow(false)} style={{position:'absolute',top:8,left:8,background:'none',border:'none',fontSize:'1.5em',color:'#888',cursor:'pointer'}}>×</button>
        <h3 style={{color:'#3182ce'}}>إشعار هام</h3>
        <div style={{margin:'12px 0',fontSize:'1.1em'}}>{renderMessage(notifText)}</div>
        <div style={{fontSize:'0.9em',color:'#888'}}>بتاريخ: {new Date(notification.date || notification.createdAt).toLocaleString()}</div>
        <button
          style={{
            background:'#43a047',
            color:'#fff',
            border:'none',
            borderRadius:'8px',
            padding:'10px 22px',
            fontSize:'1em',
            fontWeight:'bold',
            cursor:'pointer',
            marginTop:'18px'
          }}
          onClick={handleIgnore}
        >
          تم قراءته - لا تظهر هذا الاشعار مرة أخرى
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  // حالة المصادقة مع حفظ الجلسة
  const [user, setUserState] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const setUser = (u) => {
    setUserState(u);
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
    } else {
      localStorage.removeItem("user");
    }
  };
  const [activeTab, setActiveTab] = useState("order");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showBetaPopup, setShowBetaPopup] = useState(false); // تعديل: يبدأ false
  const [error, setError] = useState(null);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // اجعل الـ popup يظهر بعد 3 ثواني من عمل reload أو تسجيل الدخول
  useEffect(() => {
    const timer = setTimeout(() => setShowBetaPopup(true), 3000);
    return () => clearTimeout(timer);
  }, [user]);

  // إذا لم يسجل الدخول، أظهر شاشة تسجيل الدخول/إنشاء حساب
  if (!user) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f7fafc'}}>
        <h2 style={{color:'#3182ce',marginBottom:18}}>يرجى تسجيل الدخول للمتابعة</h2>
        <LoginRegister setUser={setUser} />
        {error && <div style={{color:'red',marginTop:18,fontWeight:'bold'}}>خطأ: {error}</div>}
      </div>
    );
  }

  // توجيه حسب نوع الحساب
  if (user.type === "provider") {
    return <CareProviderDashboard user={user} setUser={setUser} />;
  }

  // زر إدارة الأسعار يظهر فقط لمقدمي الرعاية
  const isProvider = user && user.type === "provider";
  // واجهة المريض
  const { dark, setDark } = useTheme();
  return (
    <div className={"app-root" + (dark ? " dark" : "") }>
      <button
        className="theme-toggle-btn"
        onClick={() => setDark(d => !d)}
        style={{position:'fixed',top:18,left:18,zIndex:2000,background:dark?'#222':'#fff',color:dark?'#fff':'#222',border:'none',borderRadius:8,padding:'8px 18px',boxShadow:'0 2px 8px #0002',fontWeight:'bold',cursor:'pointer'}}
        aria-label="تبديل الوضع الليلي"
      >
        {dark ? '☀️ وضع النهار' : '🌙 وضع الليل'}
      </button>
      {showWelcome ? (
        <div className="welcome-screen">
          <div className="welcome-logo-circle">
            <img src={process.env.PUBLIC_URL + "/wight.png"} alt="شعار الموقع" />
          </div>
          <h1 style={{fontWeight:900,marginTop:18,marginBottom:10,fontSize:'2.1em',color:'#215175',letterSpacing:'1px'}}>
            أهلاً بيك في <span style={{ color: "#38b2ac" }}>HealthCare InDrive</span> للرعاية الصحية
          </h1>
          <FallingIcons />
        </div>
      ) : (
        <div className="main-layout">
          <div className="main-content">
            {activeTab === "order" && <OrderNow user={user} />}
            {activeTab === "profile" && <Profile user={user} />}
            {activeTab === "track" && <TrackOrder user={user} />}
            {activeTab === "settings" && <Settings setUser={setUser} user={user} />}
            {/* زر إدارة الأسعار لمقدمي الرعاية فقط */}
            {isProvider && (
              <button
                className="admin-access-btn"
                onClick={() => setActiveTab("admin")}
                style={{
                  margin: "18px auto 0 auto",
                  display: "block",
                  background: "linear-gradient(90deg, #3182ce 60%, #38b2ac 100%)",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.08em",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 32px",
                  boxShadow: "0 2px 12px #3182ce33",
                  cursor: "pointer"
                }}
              >
                إدارة الأسعار
              </button>
            )}
            {activeTab === "admin" && isProvider && <AdminServicesPage />}
          </div>
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}
      {user && <GlobalNotificationPopup user={user} />}
      {showBetaPopup && (
        <div className="popup-overlay" style={{zIndex: 99999}}>
          <div
            className="popup-card floating-beta-popup"
            style={{
              maxWidth: 420,
              textAlign: 'center',
              padding: '38px 28px',
              borderRadius: '18px',
              boxShadow: '0 8px 40px #3182ce33',
              background: 'linear-gradient(135deg,#38b2ac 10%,#3182ce 100%)',
              color: '#fff',
              animation: 'floatingBeta 2.2s infinite alternate'
            }}
          >
            <h2 style={{fontFamily:'Cairo, Tajawal, Arial',fontWeight:'bold',fontSize:'2em',marginBottom:18,letterSpacing:'1px'}}>هذا الإصدار هو نسخة تجريبية للموقع</h2>
            <div style={{fontSize:'1.15em',marginBottom:18,fontFamily:'Cairo, Tajawal, Arial'}}>وجاري العمل على بعض المميزات والتحسينات للوصول للنسخة النهائية</div>
            <div style={{fontSize:'1em',marginBottom:18,color:'#ffd700',fontFamily:'Cairo, Tajawal, Arial'}}>
              تم تطوير هذا الموقع بواسطة : <b>Maru Faltas Shawqy</b>
            </div>
            <button
              style={{
                background:'#fff',
                color:'#3182ce',
                border:'none',
                borderRadius:'8px',
                padding:'10px 22px',
                fontSize:'1em',
                fontWeight:'bold',
                cursor:'pointer',
                marginTop:'8px'
              }}
              onClick={()=>setShowBetaPopup(false)}
            >متابعة</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: "#43a047",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 2px 12px #3182ce44",
          fontSize: "2em",
          cursor: "pointer",
          opacity: 0.85,
          transition: "opacity 0.2s"
        }}
        title="المساعد الذكي"
      >
        🤖
      </button>
      {open && (
        <div className="popup-overlay" style={{zIndex: 10000}}>
          <div className="popup-card" style={{maxWidth:350}}>
            <h3>المساعد الذكي</h3>
            <div style={{marginBottom:8}}>اسأل عن أي خدمة أو استفسار طبي وسيتم الرد عليك فوراً!</div>
            <textarea placeholder="اكتب سؤالك هنا..." style={{width:"100%",marginBottom:8}} />
            <button onClick={()=>setOpen(false)} style={{background:'#43a047',color:'#fff',padding:'8px 18px',border:'none',borderRadius:8}}>إغلاق</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
      <FloatingAssistant />
    </ThemeProvider>
  );
}