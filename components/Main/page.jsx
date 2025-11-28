'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import styles from './styles.module.css';
import Header from '../Hader/page';
import { db } from '@/app/firbase';

export default function FinanceCalculatorPage() {
  const [cars, setCars] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedCar, setSelectedCar] = useState({
    brand: '',
    model: '',
    year: '',
    transmission: '',
    category: '',
    color: '',
    price: ''
  });
  const [step, setStep] = useState(1);
  const steps = [
  { icon: '🚗', label: 'اختر السيارة' },
  { icon: '👤', label: 'بيانات العميل' },
  { icon: '💰', label: 'العروض' },
  { icon: '✔️', label: 'تنفيذ الطلب' },
];

  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    // gender: '',
    birthDate: '',
    // city: '',
    nationalId: '',
    workType: '',
    salary: '',
    salaryBank: '',
    monthlyObligations: '',
    nationality: '',
    email: '',
    financialIssues: '',
    trafficFines: '',
    drivingLicense: '',
    mortgageLoan: ''
  });
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [seller, setSeller] = useState('');

  // جلب السيارات من Firebase
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cars'), (snapshot) => {
      const carsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCars(carsData);
    });
    return () => unsub();
  }, []);

  // جلب جهات التمويل
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'banks'), (snapshot) => {
      const banksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBanks(banksData);
    });
    return () => unsub();
  }, []);

  // دوال القيم المفلترة لكل خطوة
  const getBrands = () => [...new Set(cars.map(c => c.brand))];
  const getModels = () => [...new Set(cars.filter(c => c.brand === selectedCar.brand).map(c => c.model))];
  const getYears = () => [...new Set(cars.filter(c => c.brand === selectedCar.brand && c.model === selectedCar.model).map(c => c.year))];
  const getTransmissions = () => [...new Set(cars.filter(c => c.brand === selectedCar.brand && c.model === selectedCar.model && c.year === selectedCar.year).map(c => c.transmission))];
  const getCategories = () => [...new Set(cars.filter(c => c.brand === selectedCar.brand && c.model === selectedCar.model && c.year === selectedCar.year && c.transmission === selectedCar.transmission).map(c => c.category))];
  const getColors = () => [...new Set(cars.filter(c => c.brand === selectedCar.brand && c.model === selectedCar.model && c.year === selectedCar.year && c.transmission === selectedCar.transmission && c.category === selectedCar.category).map(c => c.color))];

  // ضبط السعر تلقائي بعد اختيار كل البيانات
  useEffect(() => {
    const car = cars.find(c =>
      c.brand === selectedCar.brand &&
      c.model === selectedCar.model &&
      c.year === selectedCar.year &&
      c.transmission === selectedCar.transmission &&
      c.category === selectedCar.category &&
      c.color === selectedCar.color
    );
    setSelectedCar(prev => ({ ...prev, price: car ? car.price : '' }));
  }, [selectedCar.brand, selectedCar.model, selectedCar.year, selectedCar.transmission, selectedCar.category, selectedCar.color, cars]);

  // حساب عمر العميل
  const getClientAge = () => {
    if(!clientData.birthDate) return 0;
    const birth = new Date(clientData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // توليد العروض الحقيقية بناء على البيانات
  const generateOffers = () => {
    const age = getClientAge();
    if(!selectedCar.price) return;
    const validOffers = banks
      .filter(bank => age >= bank.minUserAge && age <= bank.maxUserAge)
      .map(bank => ({
        id: bank.id,
        bank: bank.name,
        minDownPayment: bank.minDownPayment,
        minDuration: bank.minDuration,
        maxDuration: bank.maxDuration,
        interestRate: bank.interestRate,
        notes: bank.notes
      }));
    setOffers(validOffers);
    setStep(3);
  };

  // الانتقال للخطوة التالية
  const handleNextStep = () => {
    if(step === 1 && (!selectedCar.brand || !selectedCar.model)) {
      alert('⚠️ اختر الماركة والموديل على الأقل');
      return;
    }
    if(step === 2 && (!clientData.name || !clientData.phone || !clientData.birthDate|| !clientData.workType || !clientData.salary || !clientData.salaryBank || !clientData.monthlyObligations || !clientData.nationality)) {
      alert('⚠️ أكمل بيانات العميل الأساسية');
      return;
    }
    if(step === 3 && !selectedOffer) {
      alert('⚠️ اختر العرض المناسب');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => setStep(step - 1);

  // حفظ الطلب النهائي
  const finalizeRequest = async () => {
    if(!selectedOffer || !selectedCar.price) return;
    await addDoc(collection(db, 'requests'), {
      client: clientData,
      car: selectedCar,
      offer: selectedOffer,
      seller,
      date: new Date().toISOString()
    });
    alert('✅ تم تسجيل الطلب بنجاح');
    // إعادة ضبط البيانات
    setStep(1);
    setSelectedCar({ brand: '', model: '', year: '', transmission: '', category: '', color: '', price: '' });
    setClientData({ name: '', phone: '', gender: '', birthDate: '', city: '', nationalId: '', workType: '', salary: '', salaryBank: '', monthlyObligations: '', nationality: '', email: '', financialIssues: '', trafficFines: '', drivingLicense: '', mortgageLoan: '' });
    setOffers([]);
    setSelectedOffer(null);
    setSeller('');
  }

  return (
    <div className="main">
      <Header />
      <div className={styles.container}>
        <div className={styles.title}>
          <h2>طلب تمويل</h2>
          <p>قم بملء بياناتك بسهولة لعروض التمويل</p>
        </div>

        <div className={styles.content}>
        <div className={styles.stepsWrapper}>
          {steps.map((stepItem, index) => (
            <div key={index} className={styles.stepItemWrapper}>
              <div className={styles.iconWrapper}>
                {step >= index + 1 && <span className={styles.activeCircle}></span>}
                <span className={styles.icon}>{stepItem.icon}</span>
              </div>
              <p className={styles.stepLabel}>{stepItem.label}</p>
              {index < steps.length - 1 && step > index && (
                <div className={styles.stepLine}></div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.form}>
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label>الماركة:</label>
                <select className={styles.inputField} value={selectedCar.brand} onChange={e => setSelectedCar({...selectedCar, brand: e.target.value, model:'', year:'', transmission:'', category:'', color:''})}>
                  <option value="">اختر الماركة</option>
                  {getBrands().map(brand => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </div>
              <div className={styles.inputContainer}>
                <label>الموديل:</label>
                <select className={styles.inputField} value={selectedCar.model} onChange={e => setSelectedCar({...selectedCar, model:e.target.value, year:'', transmission:'', category:'', color:''})}>
                  <option value="">اختر الموديل</option>
                  {getModels().map(model => <option key={model} value={model}>{model}</option>)}
                </select>
              </div>
              </div>
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label>سنة التصنيع:</label>
                <select className={styles.inputField} value={selectedCar.year} onChange={e => setSelectedCar({...selectedCar, year:e.target.value, transmission:'', category:'', color:''})}>
                  <option value="">اختر السنة</option>
                  {getYears().map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className={styles.inputContainer}>
                <label>نوع الجير:</label>
                <select className={styles.inputField} value={selectedCar.transmission} onChange={e => setSelectedCar({...selectedCar, transmission:e.target.value, category:'', color:''})}>
                  <option value="">اختر نوع الجير</option>
                  {getTransmissions().map(trans => <option key={trans} value={trans}>{trans}</option>)}
                </select>
              </div>
              </div>
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label>الفئة:</label>
                <select className={styles.inputField} value={selectedCar.category} onChange={e => setSelectedCar({...selectedCar, category:e.target.value, color:''})}>
                  <option value="">اختر الفئة</option>
                  {getCategories().map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className={styles.inputContainer}>
                <label>اللون:</label>
                <select className={styles.inputField} value={selectedCar.color} onChange={e => setSelectedCar({...selectedCar, color:e.target.value})}>
                  <option value="">اختر اللون</option>
                  {getColors().map(color => <option key={color} value={color}>{color}</option>)}
                </select>
              </div>
              </div>
            </div>
            )}
          {/* الخطوة 2: بيانات العميل */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label htmlFor="">اسم العميل</label>
              <input className={styles.inputField} type="text" placeholder="اسم العميل" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})}/>
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="">رقم الهاتف</label>
                <input className={styles.inputField} type="text" placeholder="رقم الهاتف" value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})}/>
              </div>
              </div>
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label className={styles.labelField}>تاريخ الميلاد:</label>
              <input className={styles.inputField} type="date" value={clientData.birthDate} onChange={e => setClientData({...clientData, birthDate: e.target.value})}/>
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="">رقم الهوية</label>
                <input className={styles.inputField} type="text" placeholder="رقم الهوية (اختياري)" value={clientData.nationalId} onChange={e => setClientData({...clientData, nationalId: e.target.value})}/>
              </div>
              </div>
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label className={styles.labelField}>جهة العمل:</label>
                <select className={styles.selectField} value={clientData.workType} onChange={e => setClientData({...clientData, workType: e.target.value})}>
                  <option value="">اختر جهة العمل</option>
                  <option value="حكومي مدني">حكومي مدني</option>
                  <option value="حكومي عسكري">حكومي عسكري</option>
                  <option value="متقاعد">متقاعد</option>
                  <option value="اخرى">اخرى</option>
                </select>
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="">الراتب</label>
                <input className={styles.inputField} type="number" placeholder="الراتب" value={clientData.salary} onChange={e => setClientData({...clientData, salary: e.target.value})}/>
              </div>
              </div>
              {/* <div className={styles.inputContainer}>
                <label className={styles.labelField}>الجنس:</label>
                <select className={styles.selectField} value={clientData.gender} onChange={e => setClientData({...clientData, gender: e.target.value})}>
                  <option value="">اختر الجنس</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div> */}
              {/* <div className={styles.inputContainer}>
                <label htmlFor="">المدينة</label>
                <input className={styles.inputField} type="text" placeholder="المدينة" value={clientData.city} onChange={e => setClientData({...clientData, city: e.target.value})}/>
              </div> */}
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label htmlFor="">جهة تحويل الراتب</label>
                <input className={styles.inputField} type="text" placeholder="جهة تحويل الراتب" value={clientData.salaryBank} onChange={e => setClientData({...clientData, salaryBank: e.target.value})}/>
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="">الالتزامات الشهرية</label>
                <input className={styles.inputField} type="number" placeholder="اجمالي الالتزامات الشهرية" value={clientData.monthlyObligations} onChange={e => setClientData({...clientData, monthlyObligations: e.target.value})}/>
              </div>
              </div>
              <div className={styles.inputBox}>
                <div className={styles.inputContainer}>
                <label className={styles.labelField}>الجنسية:</label>
                <select className={styles.selectField} value={clientData.nationality} onChange={e => setClientData({...clientData, nationality: e.target.value})}>
                  <option value="">اختر الجنسية</option>
                  <option value="سعودي">سعودي</option>
                  <option value="مقيم">مقيم</option>
                  <option value="قبائل نازحة">قبائل نازحة</option>
                </select>
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="">البريد الالكتروني</label>
                <input className={styles.inputField} type="email" placeholder="البريد الإلكتروني (اختياري)" value={clientData.email} onChange={e => setClientData({...clientData, email: e.target.value})}/>
              </div>
              </div>
              <div className={styles.radios}>
                <div className={styles.radioGroup}>
                  <label>هل يوجد تعثرات مالية؟</label>
                  <div className={styles.radioSelect}>
                     <label><input type="radio" name="financialIssues" value="نعم" checked={clientData.financialIssues === 'نعم'} onChange={e => setClientData({...clientData, financialIssues: e.target.value})}/> نعم</label>
                  <label><input type="radio" name="financialIssues" value="لا" checked={clientData.financialIssues === 'لا'} onChange={e => setClientData({...clientData, financialIssues: e.target.value})}/> لا</label>
                  </div>
                </div>
                <div className={styles.radioGroup}>
                  <label>هل يوجد مخالفات مرورية؟</label>
                  <div className={styles.radioSelect}>
                    <label><input type="radio" name="trafficFines" value="نعم" checked={clientData.trafficFines === 'نعم'} onChange={e => setClientData({...clientData, trafficFines: e.target.value})}/> نعم</label>
                    <label><input type="radio" name="trafficFines" value="لا" checked={clientData.trafficFines === 'لا'} onChange={e => setClientData({...clientData, trafficFines: e.target.value})}/> لا</label>
                  </div>
                </div>
                <div className={styles.radioGroup}>
                  <label>هل يوجد رخصة قيادة؟</label>
                  <div className={styles.radioSelect}>
                     <label><input type="radio" name="drivingLicense" value="نعم" checked={clientData.drivingLicense === 'نعم'} onChange={e => setClientData({...clientData, drivingLicense: e.target.value})}/> نعم</label>
                    <label><input type="radio" name="drivingLicense" value="لا" checked={clientData.drivingLicense === 'لا'} onChange={e => setClientData({...clientData, drivingLicense: e.target.value})}/> لا</label>
                  </div>
                </div>
                <div className={styles.radioGroup}>
                  <label>هل يوجد قرض عقاري؟</label>
                  <div className={styles.radioSelect}>
                    <label><input type="radio" name="mortgageLoan" value="نعم" checked={clientData.mortgageLoan === 'نعم'} onChange={e => setClientData({...clientData, mortgageLoan: e.target.value})}/> نعم</label>
                    <label><input type="radio" name="mortgageLoan" value="لا" checked={clientData.mortgageLoan === 'لا'} onChange={e => setClientData({...clientData, mortgageLoan: e.target.value})}/> لا</label>
                  </div>
                </div>
              </div>
              {/* <button className={`${styles.btn} ${styles.btnGenerateOffers}`} onClick={generateOffers}>احسب العروض</button> */}
            </div>
          )}
          {/* الخطوة 3: العروض */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <h3>العروض المتاحة</h3>
              {offers.map(offer => (
                <div
                  key={offer.id}
                  className={`${styles.offerCard} ${selectedOffer?.id === offer.id ? styles.selected : ''}`}
                  onClick={() => setSelectedOffer(offer)}
                >
                  <p>البنك: {offer.bank}</p>
                  <p>أقل مقدم: {offer.minDownPayment}%</p>
                  <p>المدة: {offer.minDuration} - {offer.maxDuration} سنوات</p>
                  <p>نسبة التمويل: {offer.interestRate}%</p>
                  <p>{offer.notes}</p>
                </div>
              ))}
            </div>
          )}
          {/* الخطوة 4: تنفيذ الطلب */}
          {step === 4 && selectedOffer && (
            <div className={styles.stepContent}>
              <h3>تنفيذ الطلب</h3>
              <p>العميل: {clientData.name}</p>
              <p>السيارة: {selectedCar.brand} - {selectedCar.model}</p>
              <p>البنك / جهة التمويل: {selectedOffer.bank}</p>
              <select value={seller} onChange={e => setSeller(e.target.value)}>
                <option value="">اختر اسم البائع</option>
                <option value="Ahmed">Ahmed</option>
                <option value="Mohamed">Mohamed</option>
                <option value="Ali">Ali</option>
              </select>
              <button className={styles.finalizeBtn} onClick={finalizeRequest}>تنفيذ الطلب</button>
            </div>
          )}
        </div>
        </div>
        {/* أزرار التنقل بين الخطوات */}
        <div className={styles.navigationBtns}>
          {step > 1 && <button onClick={handlePrevStep} className={styles.back}>رجوع</button>}
          {step < 4 && <button onClick={handleNextStep} className={styles.next}>التالي</button>}
        </div>
      </div>
    </div>
  );
}
