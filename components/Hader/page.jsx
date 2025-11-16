'use client';
import styles from "./styles.module.css";
import Image from "next/image";
import logo from "../../public/image/logo-removebg-preview.png";
import Link from "next/link";

export default function Header() {
    return(
        <div className={styles.headerContainer}>
            <div className={styles.right}>
                <Image src={logo} fill style={{objectFit: 'cover'}} alt="logo"/>
            </div>
            <div className={styles.middle}>
                <Link href={'/'} className={styles.headerLinks}>الحاسبة المالية</Link>
                <Link href={'/banks'} className={styles.headerLinks}>جهات التمويل</Link>
                <Link href={'/cars'} className={styles.headerLinks}>السيارات</Link>
                <Link href={'/'} className={styles.headerLinks}>الطلبات</Link>
                <Link href={'/employees'} className={styles.headerLinks}>الموظفين</Link>
                <Link href={'/'} className={styles.headerLinks}>الاعدادات</Link>
            </div>
            <div className={styles.left}>
                <Link href={'/'} className={styles.headerLinks}>تسجيل الخروج</Link>
            </div>
        </div>
    )
}