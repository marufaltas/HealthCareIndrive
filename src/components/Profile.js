import React, { useState } from "react";
import "./Profile.css";

export default function Profile({ user }) {
  // عرض بيانات المريض الفعلية
  if (!user) return null;
  return (
    <div className="profile-main">
      <div className="profile-card modern-profile-card">
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
      <div className="about-developer-card" style={{marginTop: 32}}>
        <div className="about-dev-avatar">
          <img src="/logo.png" alt="شعار المطور" />
        </div>
        <div className="about-dev-info">
          <h4>عن المطور</h4>
          <p>
            تم تطوير هذا النظام بواسطة <b>محمد أحمد</b>.<br />
            لمتابعة التحديثات أو التواصل: <a href="mailto:dev@example.com">dev@example.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}