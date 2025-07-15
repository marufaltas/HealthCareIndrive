import React from 'react';

export default function Profile() {
  return (
    <div style={{padding: 30, textAlign: 'center'}}>
      <img src="https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=0D8ABC&color=fff" alt="avatar" style={{borderRadius: '50%', width: 100}} />
      <h2>ظ\ماريو فلتس شوقي</h2>
      <p>ahmed@example.com</p>
      <hr/>
      <div>عدد العادات: 5</div>
      <div>أطول سلسلة إنجاز: 12 يوم</div>
    </div>
  );
}