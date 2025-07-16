import React from "react";
import "./ProviderAcceptedPopup.css";

export default function ProviderAcceptedPopup({ providerName, onClose }) {
  return (
    <div className="provider-accepted-popup-overlay">
      <div className="provider-accepted-popup-card">
        <div className="provider-accepted-popup-icon">🎉</div>
        <div className="provider-accepted-popup-title">تم قبول طلبك!</div>
        <div className="provider-accepted-popup-message">
          <b>{providerName}</b> في طريقه إليك الآن كمقدم رعاية صحية.
        </div>
        <button className="provider-accepted-popup-close" onClick={onClose}>حسناً</button>
      </div>
    </div>
  );
}
