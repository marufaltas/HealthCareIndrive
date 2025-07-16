import React, { useState } from "react";
import "./LoginRegister.css";

export default function LoginRegister({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    type: "patient",
    providerType: "",
    idCard: null,
    degree: null,
    license: null,
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      // تسجيل مستخدم جديد
      fetch("https://helthend-production.up.railway.app/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
        .then((res) => res.json())
        .then((user) => {
          setLoading(false);
          setUser(user);
        });
    } else {
      // تسجيل دخول: تحقق من البريد وكلمة المرور
      fetch(
        `https://helthend-production.up.railway.app/users?email=${form.email}&password=${form.password}`
      )
        .then((res) => res.json())
        .then((users) => {
          setLoading(false);
          if (users.length > 0) {
            setUser(users[0]);
          } else {
            alert("بيانات الدخول غير صحيحة");
          }
        });
    }
  }

  return (
    <div className="login-register-bg">
      <div className="login-register-card">
        <h2>{isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}</h2>
        <form onSubmit={handleSubmit} className="login-register-form">
          {isRegister && (
            <>
              <input
                type="text"
                name="fullName"
                placeholder="الاسم رباعي"
                value={form.fullName}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="age"
                placeholder="السن"
                value={form.age}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="address"
                placeholder="العنوان"
                value={form.address}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="رقم الهاتف المحمول"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={form.password}
            onChange={handleChange}
            required
          />
          {isRegister && (
            <>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="patient">مريض</option>
                <option value="provider">مقدم رعاية صحية</option>
              </select>
              {form.type === "provider" && (
                <>
                  <select
                    name="providerType"
                    value={form.providerType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">اختر التخصص</option>
                    <option value="ممرض">ممرض</option>
                    <option value="طبيب">طبيب</option>
                    <option value="استشاري">استشاري</option>
                    <option value="اخصائي علاجي طبيعي">اخصائي علاجي طبيعي</option>
                    <option value="صيدلي">صيدلي</option>
                    <option value="فني تحاليل">فني تحاليل</option>
                    <option value="فني اشعة">فني اشعة</option>
                    <option value="صاحب عيادة">صاحب عيادة</option>
                  </select>
                  <label>صورة كارنيه المهنة:</label>
                  <input
                    type="file"
                    name="license"
                    accept="image/*"
                    onChange={handleChange}
                    required
                  />
                  <label>صورة شهادة التخرج:</label>
                  <input
                    type="file"
                    name="degree"
                    accept="image/*"
                    onChange={handleChange}
                    required
                  />
                </>
              )}
              <label>صورة البطاقة الشخصية:</label>
              <input
                type="file"
                name="idCard"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "جاري المعالجة..." : isRegister ? "إنشاء حساب" : "دخول"}
          </button>
        </form>
        <div className="login-register-switch">
          {isRegister ? (
            <span>
              لديك حساب؟{" "}
              <button onClick={() => setIsRegister(false)}>تسجيل الدخول</button>
            </span>
          ) : (
            <span>
              ليس لديك حساب؟{" "}
              <button onClick={() => setIsRegister(true)}>إنشاء حساب جديد</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}