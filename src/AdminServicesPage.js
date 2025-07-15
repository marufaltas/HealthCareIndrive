import React from "react";
import AdminServices from "./components/AdminServices";

export default function AdminServicesPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7fafc" }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 10, background: "#fff", boxShadow: "0 2px 8px #0001", padding: 16, marginBottom: 24
      }}>
        <h1 style={{ margin: 0, color: "#3182ce", fontWeight: 900, fontSize: "2rem", letterSpacing: 1 }}>لوحة إدارة الأسعار</h1>
        <p style={{ color: "#666", margin: 0 }}>يمكنك تعديل أسعار جميع الخدمات والتخصصات بسهولة</p>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px #3182ce22", padding: 24 }}>
        <AdminServices />
      </div>
    </div>
  );
}
