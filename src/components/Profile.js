import React, { useState } from "react";
import "./Profile.css";

export default function Profile({ user }) {
  // عرض بيانات المريض الفعلية
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showAssistant, setShowAssistant] = useState(false);
  if (!user) return null;
  return (
    <div className="profile-main" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh'}}>
      <div className="profile-card modern-profile-card" style={{boxShadow:'0 2px 16px #3182ce22',borderRadius:18,padding:'32px 24px',background:'#fff',width:'100%',maxWidth:400,marginBottom:24}}>
        <img src={process.env.PUBLIC_URL + "/user-placeholder.png"} alt="صورة المستخدم" className="profile-img" style={{width:90,height:90,borderRadius:'50%',marginBottom:12}} onError={e => e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.fullName) + "&background=0D8ABC&color=fff"} />
        <h3 style={{fontSize:'1.5em',marginBottom:8}}>{user.fullName}</h3>
        <p className="profile-role" style={{fontSize:'1.1em',color:'#3182ce',marginBottom:16}}>{user.type === "patient" ? "مريض" : user.type === "provider" ? user.providerType : "مستخدم"}</p>
        <div className="profile-info" style={{textAlign:'right',fontSize:'1em',color:'#444',lineHeight:'2'}}>
          <div><b>العنوان:</b> {user.address}</div>
          <div><b>رقم الهاتف:</b> {user.phone}</div>
          <div><b>البريد الإلكتروني:</b> {user.email}</div>
          <div><b>العمر:</b> {user.age}</div>
          <div><b>التحقق:</b> <img src={process.env.PUBLIC_URL + "/id-card.png"} alt="بطاقة شخصية" style={{height: 32, verticalAlign: "middle", borderRadius: '8px', border: '2px solid #38b2ac'}}/></div>
        </div>
        <div style={{marginTop:24,display:'flex',gap:12,justifyContent:'center'}}>
          <button style={{background:'#3182ce',color:'#fff',padding:'10px 22px',border:'none',borderRadius:8,fontWeight:'bold',fontSize:'1em',cursor:'pointer'}} onClick={()=>setShowRating(true)}>تقييم آخر خدمة</button>
          <button style={{background:'#43a047',color:'#fff',padding:'10px 22px',border:'none',borderRadius:8,fontWeight:'bold',fontSize:'1em',cursor:'pointer'}} onClick={()=>setShowAssistant(true)}>اسأل المساعد الذكي</button>
        </div>
      </div>
      {/* Popup تقييم الخدمة */}
      {showRating && (
        <div className="popup-overlay">
          <div className="popup-card" style={{maxWidth:350}}>
            <h3>تقييم الخدمة</h3>
            <div style={{marginBottom:8}}>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{fontSize: "2em", color: star <= rating ? "#FFD700" : "#ccc", cursor: "pointer"}} onClick={()=>setRating(star)}>★</span>
              ))}
            </div>
            <textarea placeholder="اكتب تعليقك (اختياري)" value={comment} onChange={e => setComment(e.target.value)} style={{width:"100%",marginBottom:8}} />
            <button onClick={()=>{setShowRating(false);setRating(0);setComment("");}} style={{background:'#3182ce',color:'#fff',padding:'8px 18px',border:'none',borderRadius:8}}>إرسال التقييم</button>
            <button onClick={()=>setShowRating(false)} style={{marginTop:8}}>إغلاق</button>
          </div>
        </div>
      )}
      {/* Popup المساعد الذكي */}
      {showAssistant && (
        <div className="popup-overlay">
          <div className="popup-card" style={{maxWidth:350}}>
            <h3>المساعد الذكي</h3>
            <div style={{marginBottom:8}}>اسأل عن أي خدمة أو استفسار طبي وسيتم الرد عليك فوراً!</div>
            <textarea placeholder="اكتب سؤالك هنا..." style={{width:"100%",marginBottom:8}} />
            <button onClick={()=>setShowAssistant(false)} style={{background:'#43a047',color:'#fff',padding:'8px 18px',border:'none',borderRadius:8}}>إغلاق</button>
          </div>
        </div>
      )}
      {/* عن المطور */}
      <div className="about-developer-card" style={{marginTop: 0,boxShadow:'0 2px 8px #3182ce22',borderRadius:14,padding:'18px 16px',background:'#f7fafc',width:'100%',maxWidth:400}}>
        <div className="about-dev-avatar" style={{display:'flex',justifyContent:'center',marginBottom:8}}>
          <img src={process.env.PUBLIC_URL + "/logo.png"} alt="شعار المطور" style={{width:48,height:48,borderRadius:'50%'}} />
        </div>
        <div className="about-dev-info" style={{textAlign:'center'}}>
          <h4 style={{marginBottom:6,color:'#3182ce'}}>عن المطور</h4>
          <p style={{fontSize:'1em',color:'#222',margin:0}}>
            تم تطوير هذا النظام بواسطة <b>ماريو فلتس شوقي</b>.<br />
            للتواصل وحل المشكلات برجاء الاتصال على الرقم:<br />
            <span style={{fontWeight:'bold',color:'#38b2ac',fontSize:'1.1em'}}>01069663958</span>
          </p>
        </div>
      </div>
    </div>
  );
}