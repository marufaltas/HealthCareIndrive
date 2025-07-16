import React, { useState } from "react";
import "./Profile.css";

export default function Profile({ user }) {
  // عرض بيانات المريض الفعلية
  if (!user) return null;
  return (
    <div className="profile-main" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh'}}>
      <div className="profile-card modern-profile-card" style={{margin:'0 auto'}}>
        <img src="/user-placeholder.png" alt="صورة المستخدم" className="profile-img" />
        <h3>{user.fullName}</h3>
        <p className="profile-role">{user.type === "patient" ? "مريض" : user.type === "provider" ? user.providerType : "مستخدم"}</p>
        <div className="profile-info">
          <div>العنوان: {user.address}</div>
          <div>رقم الهاتف: {user.phone}</div>
          <div>البريد الإلكتروني: {user.email}</div>
          <div>العمر: {user.age}</div>
          <div>التحقق: <img src="/id-card.png" alt="بطاقة شخصية" style={{height: 32, verticalAlign: "middle", borderRadius: '8px', border: '2px solid #38b2ac'}}/></div>
        </div>
      </div>
      {/* عن المطور */}
      <div className="about-developer-card" style={{marginTop: 40, marginBottom: 10, textAlign:'center'}}>
        <div className="about-dev-avatar">
          <img src="/logo.png" alt="شعار المطور" />
        </div>
        <div className="about-dev-info">
          <h4>عن المطور</h4>
          <p>
            تم تطوير هذا النظام بواسطة <b>ماريو فلتس شوقي</b>.<br />
            للتواصل: <a href="tel:01069663958">01069663958</a>
          </p>
        </div>
      </div>
    </div>
  );
}