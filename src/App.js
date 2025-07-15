import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import OrderNow from "./components/OrderNow";
import TrackOrder from "./components/TrackOrder";
import Settings from "./components/Settings";
import LoginRegister from "./components/LoginRegister";
import CareProviderDashboard from "./components/CareProviderDashboard";
import AdminPage from "./AdminPage";
import AdminServicesPage from "./AdminServicesPage";
import "./App.css";


export default function App() {
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

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // إذا لم يسجل الدخول، أظهر شاشة تسجيل الدخول/إنشاء حساب
  if (!user) {
    return <LoginRegister setUser={setUser} />;
  }

  // توجيه حسب نوع الحساب
  if (user.type === "provider") {
    return <CareProviderDashboard user={user} setUser={setUser} />;
  }

  // زر إدارة الأسعار يظهر فقط لمقدمي الرعاية
  const isProvider = user && user.type === "provider";

  // واجهة المريض
  return (
    <div className="app-root">
      {showWelcome ? (
        <div className="welcome-screen">
          <h1>
            أهلاً بيك في <span style={{ color: "#38b2ac" }}>MarioSNurse</span> للرعاية الصحية
          </h1>
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
    </div>
  );
}