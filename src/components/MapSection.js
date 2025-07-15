import React from "react";
import "./MapSection.css";

export default function MapSection({location, searching}) {
  // خريطة Google أو صورة ثابتة إذا لم يتم تحديد الموقع
  return (
    <div className="map-wrapper">
      {searching && (
        <div className="searching-overlay">
          <span>جاري البحث عن مقدم الخدمة الأقرب...</span>
        </div>
      )}
      {location ? (
        <iframe
          title="خريطة المريض"
          width="100%"
          height="100%"
          style={{ borderRadius: "18px" }}
          frameBorder="0"
          src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
          allowFullScreen
        ></iframe>
      ) : (
        <img src="/map-sample.jpg" alt="خريطة افتراضية" className="default-map-image" />
      )}
    </div>
  );
}