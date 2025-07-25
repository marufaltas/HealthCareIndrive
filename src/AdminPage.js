import React, { useEffect, useState } from "react";
import AdminServices from "./components/AdminServices";

// استخدم هذا المتغير في كل fetch بدلاً من كتابة الرابط مباشرة
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://helthend-production.up.railway.app";

const AdminPage = () => {
  const [allServices, setAllServices] = useState({});
  // جلب جميع الخدمات من قاعدة البيانات بشكل ديناميكي
  useEffect(() => {
    // التخصصات المدعومة (يمكنك إضافة المزيد حسب قاعدة البيانات)
    const serviceKeys = [
      "nurseServices",
      "doctorServices",
      "physioServices",
      "pharmacistServices",
      "labServices",
      "xrayServices",
      "psychologyServices",
      "babycareServices",
      "nutritionServices"
    ];
    Promise.all(
      serviceKeys.map(key =>
        fetch(`${API_BASE}/${key}`)
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      )
    ).then(results => {
      const services = {};
      serviceKeys.forEach((key, idx) => {
        services[key] = results[idx] || [];
      });
      setAllServices(services);
    });
  }, []);

  // تحديث الأسعار (هنا يجب ربطها بباك اند حقيقي أو json-server)
  const handleUpdate = (updated) => {
    setAllServices(updated);
    // تحديث الأسعار فعلياً في json-server
    Object.keys(updated).forEach(serviceType => {
      updated[serviceType].forEach(service => {
        fetch(`${API_BASE}/${serviceType}/${service.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ basePrice: service.basePrice })
        });
      });
    });
  };

  return <AdminServices allServices={allServices} onUpdate={handleUpdate} />;
};

export default AdminPage;
