import React, { useEffect, useState } from "react";
import AdminServices from "./components/AdminServices";


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
      "xrayServices"
    ];
    Promise.all(
      serviceKeys.map(key =>
        fetch(`https://helthend-production.up.railway.app/${key}`)
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
    // مثال: إرسال البيانات للباك اند
    // fetch('/api/services', { method: 'PUT', body: JSON.stringify(updated) })
  };

  return <AdminServices allServices={allServices} onUpdate={handleUpdate} />;
};

export default AdminPage;
