'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../firbase';
import Header from '../../../components/Hader/page';
import styles from './styles.module.css';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [sales, setSales] = useState([]);

  const [showAddPopup, setShowAddPopup] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '' });

  // جلب الموظفين من Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmployees(data);
    });
    return () => unsub();
  }, []);

  // فتح تفاصيل المبيعات للموظف
  const handleShowDetails = (employee) => {
    setSelectedEmployee(employee);
    const q = query(collection(db, 'sales'), where('employeeId', '==', employee.id));
    const unsubSales = onSnapshot(q, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(salesData);
    });
    setShowPopup(true);
    return () => unsubSales();
  };

  // حساب إجمالي المبيعات لكل موظف
  const getTotalSales = (employeeId) => {
    const empSales = sales.filter(s => s.employeeId === employeeId);
    return empSales.reduce((sum, s) => sum + s.price, 0);
  };

  // حذف موظف
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'employees', id));
  };

  // إضافة موظف جديد
  const handleAddEmployee = async () => {
    if (!newEmployee.name) {
      alert('⚠️ أدخل اسم الموظف');
      return;
    }
    await addDoc(collection(db, 'employees'), newEmployee);
    setNewEmployee({ name: '', email: '' });
    setShowAddPopup(false);
  };

  // تصفية الموظفين حسب البحث
  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="main">
      <Header />
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>تقرير الموظفين</h2>
          <button className={styles.addButton} onClick={() => setShowAddPopup(true)}>+ إضافة موظف</button>
        </div>

        {/* حقل البحث */}
        <input
          type="text"
          placeholder="ابحث باسم الموظف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        {/* جدول الموظفين */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>اسم الموظف</th>
              <th>البريد الإلكتروني</th>
              <th>عدد المبيعات</th>
              <th>إجمالي المبيعات</th>
              <th>التفاصيل</th>
              <th>حذف</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{sales.filter(s => s.employeeId === emp.id).length}</td>
                <td>{getTotalSales(emp.id).toLocaleString()} ريال</td>
                <td>
                  <button className={styles.detailsBtn} onClick={() => handleShowDetails(emp)}>عرض التفاصيل</button>
                </td>
                <td>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(emp.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Popup تفاصيل المبيعات */}
        {showPopup && selectedEmployee && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h3 className={styles.popupTitle}>تفاصيل مبيعات {selectedEmployee.name}</h3>
              <table className={styles.popupTable}>
                <thead>
                  <tr>
                    <th>السيارة</th>
                    <th>السعر</th>
                    <th>البنك</th>
                    <th>نسبة التمويل</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.carName}</td>
                      <td>{sale.price.toLocaleString()} ريال</td>
                      <td>{sale.bankName}</td>
                      <td>{sale.interestRate}%</td>
                      <td>{sale.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className={styles.closeBtn} onClick={() => setShowPopup(false)}>إغلاق</button>
            </div>
          </div>
        )}

        {/* Popup إضافة موظف */}
        {showAddPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h3 className={styles.popupTitle}>إضافة موظف جديد</h3>
              <input
                placeholder="اسم الموظف"
                value={newEmployee.name}
                onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
              <input
                placeholder="البريد الإلكتروني"
                value={newEmployee.email}
                onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
              <div className={styles.popupActions}>
                <button onClick={handleAddEmployee} className={styles.saveBtn}>💾 حفظ</button>
                <button onClick={() => setShowAddPopup(false)} className={styles.cancelBtn}>إلغاء</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
