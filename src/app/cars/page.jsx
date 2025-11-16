'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import styles from './styles.module.css';
import { db } from '../firbase';
import Header from '../../../components/Hader/page';

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: '',
    transmission: '',
    category: '',
    color: '',
    price: ''
  });

  // جلب السيارات من Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cars'), (snapshot) => {
      const carsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCars(carsData);
    });
    return () => unsub();
  }, []);

  // إضافة سيارة جديدة
  const handleAddCar = async () => {
    if (!newCar.brand || !newCar.model || !newCar.price) {
      alert('⚠️ أدخل الماركة، الموديل والسعر');
      return;
    }
    await addDoc(collection(db, 'cars'), {
      ...newCar,
      price: parseFloat(newCar.price),
      available: true
    });
    setNewCar({ brand: '', model: '', year: '', transmission: '', category: '', color: '', price: '' });
    setShowPopup(false);
  };

  // حذف سيارة
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'cars', id));
  };

  // تصفية السيارات حسب البحث
  const filteredCars = cars.filter(car => car.brand.toLowerCase().includes(searchTerm.toLowerCase()) || car.model.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="main">
      <Header />
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>إدارة السيارات</h2>
          <button className={styles.addButton} onClick={() => setShowPopup(true)}>+ إضافة سيارة</button>
        </div>

        {/* حقل البحث */}
        <input
          className={styles.searchInput}
          type="text"
          placeholder="ابحث بالماركة أو الموديل..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* جدول عرض السيارات */}
        <table className={styles.carsTable}>
          <thead>
            <tr>
              <th>الماركة</th>
              <th>الموديل</th>
              <th>سنة التصنيع</th>
              <th>نوع الجير</th>
              <th>الفئة</th>
              <th>اللون</th>
              <th>السعر</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.map(car => (
              <tr key={car.id}>
                <td>{car.brand}</td>
                <td>{car.model}</td>
                <td>{car.year}</td>
                <td>{car.transmission}</td>
                <td>{car.category}</td>
                <td>{car.color}</td>
                <td>{car.price.toLocaleString()} ريال</td>
                <td>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(car.id)}>🗑 حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Popup إضافة سيارة */}
        {showPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h3 className={styles.popupTitle}>إضافة سيارة جديدة</h3>
              <div className={styles.popupForm}>
                <input placeholder="ماركة السيارة" value={newCar.brand} onChange={e => setNewCar({...newCar, brand: e.target.value})} />
                <input placeholder="موديل السيارة" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} />
                <input placeholder="سنة التصنيع" type="number" value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})} />
                <input placeholder="نوع الجير" value={newCar.transmission} onChange={e => setNewCar({...newCar, transmission: e.target.value})} />
                <input placeholder="فئة السيارة" value={newCar.category} onChange={e => setNewCar({...newCar, category: e.target.value})} />
                <input placeholder="اللون" value={newCar.color} onChange={e => setNewCar({...newCar, color: e.target.value})} />
                <input placeholder="السعر" type="number" value={newCar.price} onChange={e => setNewCar({...newCar, price: e.target.value})} />
              </div>
              <div className={styles.popupActions}>
                <button onClick={handleAddCar} className={styles.saveBtn}>💾 حفظ</button>
                <button onClick={() => setShowPopup(false)} className={styles.cancelBtn}>إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
