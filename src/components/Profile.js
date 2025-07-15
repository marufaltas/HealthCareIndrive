import React, { useState } from "react";
import "./Profile.css";

export default function Profile({ user }) {
  // عرض بيانات المريض الفعلية
  if (!user) return null;
  return (
    <div className="profile-main">
      <div className="profile-card">
        <img src="/user-placeholder.png" alt="صورة المستخدم" className="profile-img" />
        <h3>{user.fullName}</h3>
        <p className="profile-role">{user.type === "patient" ? "مريض" : user.type === "provider" ? user.providerType : "مستخدم"}</p>
        <div className="profile-info">
          <div>العنوان: {user.address}</div>
          <div>رقم الهاتف: {user.phone}</div>
          <div>البريد الإلكتروني: {user.email}</div>
          <div>العمر: {user.age}</div>
          <div>التحقق: <img src="/id-card.png" alt="بطاقة شخصية" style={{height: 32, verticalAlign: "middle"}}/></div>
        </div>
      </div>
    </div>
  );
}