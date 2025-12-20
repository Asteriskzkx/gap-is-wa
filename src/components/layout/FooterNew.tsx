import Image from "next/image";
import styles from "./Footer.module.css";

export default function FooterNew() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.leftSection}>
            <Image
              src="/logo-with-text.png"
              alt="Rubber Authority of Thailand Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <p className={styles.copyright}>
              © {new Date().getFullYear()} การยางแห่งประเทศไทย. สงวนลิขสิทธิ์.
            </p>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.linkList}>
              <a href="/privacy-policy" className={styles.footerLink}>
                นโยบายความเป็นส่วนตัว
              </a>
              <a href="/terms-of-service" className={styles.footerLink}>
                เงื่อนไขการใช้งาน
              </a>
              <a href="/contact" className={styles.footerLink}>
                ติดต่อเรา
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
