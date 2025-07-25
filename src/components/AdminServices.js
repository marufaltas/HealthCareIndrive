import React, { useState } from "react";
import "./AdminServices.css";

const PASSWORD = "2%txPg6DXN";

// توليد التبويبات ديناميكياً من allServices
const serviceLabels = {
  nurseServices: "خدمات التمريض",
  doctorServices: "خدمات الطبيب",
  physioServices: "خدمات العلاج الطبيعي",
  pharmacistServices: "خدمات الصيدلي",
  labServices: "خدمات التحاليل",
  xrayServices: "خدمات الأشعة",
  psychologyServices: "خدمات العلاج النفسي",
  babycareServices: "خدمات تمريض حديثي الولادة",
  nutritionServices: "خدمات استشاري التغذية"
};

const AdminServices = ({ allServices, onUpdate }) => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  // أول تبويب متاح
  // أول تبويب متاح
  const [tab, setTab] = useState(null);
  // إعداد نسخة قابلة للتعديل من جميع الخدمات
  const [edited, setEdited] = useState({});


  // تحديث نسخة الخدمات عند تغيير allServices
  React.useEffect(() => {
    if (allServices && Object.keys(allServices).length > 0) {
      setEdited(allServices);
      setTab(Object.keys(allServices)[0]);
    }
  }, [allServices]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === PASSWORD) setAuthenticated(true);
    else alert("كلمة المرور غير صحيحة");
  };

  const handleChange = (serviceType, id, value) => {
    setEdited((prev) => ({
      ...prev,
      [serviceType]: prev[serviceType].map((s) =>
        s.id === id ? { ...s, basePrice: value } : s
      ),
    }));
  };

  const handleSave = () => {
    onUpdate(edited);
    // تحديث الأسعار فعلياً في json-server
    // لكل تخصص ولكل خدمة يتم إرسال PATCH
    Object.keys(edited).forEach(serviceType => {
      edited[serviceType].forEach(service => {
        fetch(`https://helthend-production.up.railway.app/${serviceType}/${service.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ basePrice: service.basePrice })
        });
      });
    });
    alert("تم حفظ الأسعار وتحديثها بنجاح!");
  };


  if (!authenticated) {
    return (
      <div className="admin-login">
        <form onSubmit={handleLogin}>
          <h2>تسجيل دخول الإدارة</h2>
          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">دخول</button>
        </form>
      </div>
    );
  }


  return (
    <div className="admin-services" style={{maxHeight:'70vh',overflow:'auto',paddingBottom:32}}>
      <div className="admin-tabs" style={{position:'sticky',top:0,background:'#fff',zIndex:2,boxShadow:'0 2px 8px #0001',padding:'8px 0'}}>
        {Object.keys(allServices).length === 0 ? (
          <span style={{color:'#888'}}>لا توجد تخصصات متاحة</span>
        ) : (
          Object.keys(allServices).map((key) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => setTab(key)}
              style={{marginLeft:8,marginRight:8,minWidth:120,fontWeight:700,fontSize:'1.1em',padding:'8px 18px',borderRadius:8,border:'none',background:tab===key?'#3182ce':'#e2e8f0',color:tab===key?'#fff':'#222',transition:'0.2s'}}
            >
              {serviceLabels[key] || key}
            </button>
          ))
        )}
      </div>
      {tab && edited[tab] && edited[tab].length > 0 ? (
        <>
          <h2>تعديل أسعار {serviceLabels[tab] || tab}</h2>
          <table>
            <thead>
              <tr>
                <th>الخدمة</th>
                <th>السعر الأساسي (جنيه)</th>
              </tr>
            </thead>
            <tbody>
              {edited[tab].map((service) => (
                <tr key={service.id}>
                  <td>{service.name}</td>
                  <td>
                    <input
                      type="number"
                      value={service.basePrice}
                      onChange={(e) => handleChange(tab, service.id, Number(e.target.value))}
                      min={0}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div style={{margin:'30px 0', color:'#888'}}>لا توجد خدمات متاحة لهذا التخصص</div>
      )}
      <button className="save-btn" onClick={handleSave}>
        حفظ التعديلات
      </button>
    </div>
  );
};

export default AdminServices;
