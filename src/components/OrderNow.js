import React, { useState, useEffect } from "react";
import "./OrderNow.css";

const providerTypes = [
  { key: "doctor", label: "طبيب", icon: "/doctor-icon.png", color: "#3182ce" },
  { key: "nurse", label: "ممرض", icon: "/nurse-icon.png", color: "#38b2ac" },
  { key: "physio", label: "علاج طبيعي", icon: "/pharmacist-icon.png", color: "#f6ad55" },
  { key: "lab", label: "تحاليل", icon: "/pharmacist-icon.png", color: "#f56565" },
  { key: "xray", label: "أشعة", icon: "/pharmacist-icon.png", color: "#805ad5" },
  { key: "pharmacist", label: "صيدلي", icon: "/pharmacist-icon.png", color: "#ecc94b" },
];

export default function OrderNow({ user }) {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [services, setServices] = useState([]);
  // دعم اختيار أكثر من خدمة
  const [selectedServices, setSelectedServices] = useState([]);
  const [location, setLocation] = useState({ address: "", lat: "", lng: "" });
  const [basePrice, setBasePrice] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [sending, setSending] = useState(false);
  // متغير لتحديد آخر عنصر مختار (لزر التالي العصري)
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  // يجب أن يكون هنا وليس بعد الشروط
  const [showSuccess, setShowSuccess] = useState(false);

  // جلب التخصصات من db.json
  useEffect(() => {
    if (selectedType) {
      fetch(`https://helthend-production.up.railway.app/services?providerType=${selectedType.key}`)
        .then(res => res.json())
        .then(data => {
          // استخرج التخصصات الفريدة
          const specialties = [...new Set(data.map(s => s.specialty))];
          setSpecialties(specialties);
        });
    }
  }, [selectedType]);

  // جلب الخدمات حسب نوع مقدم الخدمة
  useEffect(() => {
    if (selectedType) {
      let endpoint = "";
      if (selectedType.key === "nurse") endpoint = "/nurseServices";
      else if (selectedType.key === "doctor") endpoint = "/doctorServices";
      else if (selectedType.key === "physio") endpoint = "/physioServices";
      else if (selectedType.key === "pharmacist") endpoint = "/pharmacistServices";
      else if (selectedType.key === "lab") endpoint = "/labServices";
      else if (selectedType.key === "xray") endpoint = "/xrayServices";
      if (endpoint) {
        fetch(`https://helthend-production.up.railway.app${endpoint}`)
          .then(res => res.json())
          .then(data => setServices(data || []));
      } else {
        setServices([]);
      }
    }
  }, [selectedType]);

  // حساب السعر الكلي لجميع الخدمات المختارة
  useEffect(() => {
    if (selectedType && selectedServices.length > 0) {
      const total = selectedServices.reduce((sum, name) => {
        const service = services.find(s => s.name === name);
        return sum + (service ? service.basePrice : 0);
      }, 0);
      setBasePrice(total);
    } else {
      setBasePrice(0);
    }
  }, [selectedServices, services, selectedType]);

  // تحديد الموقع تلقائياً
  // تحديد الموقع تلقائياً مع جلب العنوان من OpenStreetMap (Nominatim)
  function detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // جلب العنوان من Nominatim
        let address = "";
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`);
          const data = await res.json();
          address = data.display_name || "";
        } catch {}
        setLocation({
          ...location,
          lat,
          lng,
          address
        });
      }, err => {
        alert("تعذر تحديد الموقع. يرجى السماح بالوصول للموقع أو المحاولة لاحقاً.");
      }, { enableHighAccuracy: true });
    } else {
      alert("المتصفح لا يدعم تحديد الموقع الجغرافي.");
    }
  }

  // إرسال الطلب (يدعم عدة خدمات)
  // إرسال الطلب (يدعم عدة خدمات) مع رسالة نجاح وتوجيه تلقائي
  // إرسال الطلب (يربط الطلب بمقدم خدمة متاح)
  function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    // جلب مقدمي الخدمة المتاحين لهذا التخصص
    fetch(`https://helthend-production.up.railway.app/users?type=provider&providerType=${encodeURIComponent(selectedType.label)}`)
      .then(res => res.json())
      .then(providers => {
        // اختر أول مقدم خدمة متاح (يمكنك تطوير المنطق لاحقاً)
        const provider = providers[0];
        const orderBody = {
          patientId: user.id,
          providerType: selectedType.key,
          specialty: selectedSpecialty,
          serviceNames: selectedServices,
          location,
          basePrice,
          suggestedPrice,
          status: "new",
          createdAt: new Date().toISOString(),
          providerId: provider ? provider.id : null,
          providerName: provider ? provider.fullName : null,
          providerPhone: provider ? provider.phone : null,
          patientName: user.fullName,
          address: location.address
        };
        return fetch("https://helthend-production.up.railway.app/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderBody),
        });
      })
      .then(() => {
        setSending(false);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          if (window && window.location) {
            window.location.href = "/track-order";
          }
        }, 1500);
      });
  }

  // واجهة اختيار التخصص أو الخدمة
  if (step === 0) {
    return (
      <div className="order-cards-container">
        <h2>اختر نوع مقدم الخدمة</h2>
        <div className="cards-list">
          {providerTypes.map((type) => (
            <div
              key={type.key}
              className="order-card"
              style={{ background: type.color }}
              onClick={() => {
                setSelectedType(type);
                setStep(1);
              }}
            >
              <img src={type.icon} alt={type.label} className="order-card-icon" />
              <div>{type.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // واجهة اختيار الخدمات (دعم multi-select + زر "التالي" أسفل آخر خدمة مختارة بشكل عصري)
  if (step === 1 && selectedType) {
    return (
      <div className="order-step">
        <h2>اختر الخدمات المطلوبة</h2>
        <div className="services-list-grid-modern">
          {services.length === 0 && <div className="no-services">لا توجد خدمات متاحة لهذا التخصص حالياً.</div>}
          {services.map((s, idx) => {
            const isSelected = selectedServices.includes(s.name);
            return (
              <div
                key={s.id}
                className={`service-card-modern${isSelected ? " selected" : ""}`}
                onClick={() => {
                  setSelectedServices(prev => {
                    let next;
                    if (isSelected) {
                      next = prev.filter(name => name !== s.name);
                    } else {
                      next = [...prev, s.name];
                      setLastSelectedIndex(idx);
                    }
                    // إذا ألغى آخر خدمة مختارة، حدث المؤشر
                    if (isSelected && lastSelectedIndex === idx) {
                      setLastSelectedIndex(null);
                    }
                    return next;
                  });
                }}
              >
                <div className="service-icon-modern">
                  <span role="img" aria-label="خدمة">🩺</span>
                </div>
                <div className="service-info-modern">
                  <div className="service-name-modern">{s.name}</div>
                  <div className="service-price-modern">{s.basePrice} ج.م</div>
                </div>
                {/* زر التالي يظهر أسفل آخر خدمة مختارة */}
                {selectedServices.length > 0 && lastSelectedIndex === idx && (
                  <button
                    className="next-btn-modern floating-next-btn"
                    onClick={e => {
                      e.stopPropagation();
                      setStep(3);
                    }}
                  >
                    التالي
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }



  // واجهة الموقع والسعر
  if (step === 3 && selectedType) {
    return (
      <>
        {showSuccess && (
          <div className="success-message-green modern-success">
            <span className="success-icon">✔</span>
            تم إرسال الطلب بنجاح! سيتم تحويلك لصفحة تتبع الطلب...
          </div>
        )}
        <form className="order-step" onSubmit={handleSubmit}>
          <h2>حدد موقعك</h2>
          <div className="location-row-modern">
            <input
              type="text"
              className="modern-input"
              placeholder="العنوان بالتفصيل"
              value={location.address}
              onChange={e => setLocation({ ...location, address: e.target.value })}
            />
            <button type="button" className="detect-btn-modern" onClick={detectLocation}>
              <span role="img" aria-label="موقع">📍</span> تحديد الموقع تلقائياً
            </button>
          </div>
          <div className="price-box modern-price-box">
            <b>إجمالي سعر الخدمات:</b> <span className="main-price">{basePrice} ج.م</span>
          </div>
          <input
            type="number"
            className="modern-input"
            placeholder="اقتراح سعر (اختياري)"
            value={suggestedPrice}
            onChange={e => setSuggestedPrice(e.target.value)}
          />
          <button type="submit" disabled={sending} className="modern-send-btn">
            {sending ? <span className="loader"></span> : <><span role="img" aria-label="إرسال">🚀</span> إرسال الطلب</>}
          </button>
        </form>
      </>
    );
  }

  return null;
}