'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firbase';
import styles from './styles.module.css';
import Header from '../../../components/Hader/page';

export default function BanksPage() {
  const [banks, setBanks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBank, setNewBank] = useState({
    name: '',
    type: '',
    minDownPayment: '',
    minDuration: '',
    maxDuration: '',
    minUserAge: '',
    maxUserAge: '',
    interestRate: '',
    notes: ''
  });

  // جلب البنوك من Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'banks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanks(data);
    });
    return () => unsub();
  }, []);

  // إضافة بنك جديد
  const handleAddBank = async () => {
    if (!newBank.name || !newBank.type) {
      alert('⚠️ أدخل اسم الجهة ونوعها');
      return;
    }

    await addDoc(collection(db, 'banks'), {
      ...newBank,
      minDownPayment: Number(newBank.minDownPayment),
      minDuration: Number(newBank.minDuration),
      maxDuration: Number(newBank.maxDuration),
      minUserAge: Number(newBank.minUserAge),
      maxUserAge: Number(newBank.maxUserAge),
      interestRate: Number(newBank.interestRate)
    });

    setNewBank({
      name: '',
      type: '',
      minDownPayment: '',
      minDuration: '',
      maxDuration: '',
      minUserAge: '',
      maxUserAge: '',
      interestRate: '',
      notes: ''
    });
    setShowPopup(false);
  };

  // حذف بنك
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'banks', id));
  };

  // فلترة البيانات حسب البحث
  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="main">
      <Header />
      <div className={styles.container}>

        {/* Header + زر الإضافة */}
        <div className={styles.headerRow}>
          <h2 className={styles.title}>جهات التمويل والبنوك</h2>
          <button className={styles.addBtn} onClick={() => setShowPopup(true)}>+ إضافة جهة تمويل</button>
        </div>

        {/* Search Field */}
        <input
          className={styles.searchInput}
          type="text"
          placeholder="ابحث عن اسم البنك..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.banksTable}>
            <thead>
              <tr>
                <th>اسم البنك</th>
                <th>النوع</th>
                <th>أقل مقدم %</th>
                <th>المدة (سنوات)</th>
                <th>أقل سن</th>
                <th>أقصى سن</th>
                <th>نسبة التمويل %</th>
                <th>ملاحظات</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanks.map(bank => (
                <tr key={bank.id}>
                  <td>{bank.name}</td>
                  <td>{bank.type}</td>
                  <td>{bank.minDownPayment}</td>
                  <td>{bank.minDuration} - {bank.maxDuration}</td>
                  <td>{bank.minUserAge}</td>
                  <td>{bank.maxUserAge}</td>
                  <td>{bank.interestRate}</td>
                  <td>{bank.notes}</td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(bank.id)}>حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Popup لإضافة بنك */}
        {showPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h3 className={styles.popupTitle}>إضافة جهة تمويل جديدة</h3>
              <input placeholder="اسم الجهة" value={newBank.name} onChange={e => setNewBank({ ...newBank, name: e.target.value })} />
              <input placeholder="النوع (بنك / شركة تمويل)" value={newBank.type} onChange={e => setNewBank({ ...newBank, type: e.target.value })} />
              <input placeholder="أقل مقدم %" type="number" value={newBank.minDownPayment} onChange={e => setNewBank({ ...newBank, minDownPayment: e.target.value })} />
              <input placeholder="أقل مدة (بالسنوات)" type="number" value={newBank.minDuration} onChange={e => setNewBank({ ...newBank, minDuration: e.target.value })} />
              <input placeholder="أقصى مدة (بالسنوات)" type="number" value={newBank.maxDuration} onChange={e => setNewBank({ ...newBank, maxDuration: e.target.value })} />
              <input placeholder="أقل سن للمستخدم" type="number" value={newBank.minUserAge} onChange={e => setNewBank({ ...newBank, minUserAge: e.target.value })} />
              <input placeholder="أقصى سن للمستخدم" type="number" value={newBank.maxUserAge} onChange={e => setNewBank({ ...newBank, maxUserAge: e.target.value })} />
              <input placeholder="نسبة التمويل السنوية %" type="number" value={newBank.interestRate} onChange={e => setNewBank({ ...newBank, interestRate: e.target.value })} />
              <textarea placeholder="ملاحظات إضافية" value={newBank.notes} onChange={e => setNewBank({ ...newBank, notes: e.target.value })}></textarea>

              <div className={styles.popupButtons}>
                <button className={styles.confirmBtn} onClick={handleAddBank}>إضافة</button>
                <button className={styles.cancelBtn} onClick={() => setShowPopup(false)}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
