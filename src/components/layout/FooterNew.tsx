import Image from "next/image";
import styles from "./Footer.module.css";
import { PrimaryButton } from "../ui";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import { Button } from "primereact/button";
import PolicyContent from "../PolicyContent";
import TermOfServiceContent from "../TermOfServiceContent";
import ContactContent from "../ContactContent";

export default function FooterNew() {

  const [privacyDialogVisible, setPrivacyDialogVisible] = useState(false);
  const [termOfServiceDialogVisible, setTermOfServiceDialogVisible] = useState(false);
  const [contactDialogVisible, setContactDialogVisible] = useState(false);

  const headerPrivacyElement = (
    <div className="inline-flex align-items-center justify-content-center gap-2">
      <span className="font-bold white-space-nowrap">นโยบายความเป็นส่วนตัว ( Privacy Policy )</span>
    </div>
  );

  const headerTermOfServiceElement = (
    <div className="inline-flex align-items-center justify-content-center gap-2">
      <span className="font-bold white-space-nowrap">ข้อกำหนดและเงื่อนไขการใช้งาน ( Term of Service )</span>
    </div>
  );

  const headerContactElement = (
    <div className="inline-flex align-items-center justify-content-center gap-2">
      <span className="font-bold white-space-nowrap">ติดต่อ ( Contact )</span>
    </div>
  );


  const footerContent = (
    // <div>
    //     <Button label="Ok" icon="pi pi-cross" onClick={() => setPrivacyDialogVisible(false)} autoFocus />
    // </div>
    <></>
  );

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
              <PrimaryButton variant="text" color="secondary" label="นโยบายความเป็นส่วนตัว" onClick={() => setPrivacyDialogVisible(true)} />
              <Dialog blockScroll={true} draggable={false} visible={privacyDialogVisible} modal header={headerPrivacyElement} footer={footerContent} onHide={() => { if (privacyDialogVisible) return setPrivacyDialogVisible(false) }} >
                <PolicyContent />
              </Dialog>

              <PrimaryButton variant="text" color="secondary" label="ข้อกำหนดและเงื่อนไขการใช้งาน" onClick={() => setTermOfServiceDialogVisible(true)} />
              <Dialog blockScroll={true} draggable={false} visible={termOfServiceDialogVisible} modal header={headerTermOfServiceElement} footer={footerContent} onHide={() => { if (termOfServiceDialogVisible) return setTermOfServiceDialogVisible(false) }} >
                <TermOfServiceContent />
              </Dialog>

              <PrimaryButton variant="text" color="secondary" label="ติดต่อ" onClick={() => setContactDialogVisible(true)} />
              <Dialog blockScroll={true} draggable={false} visible={contactDialogVisible} modal header={headerContactElement} footer={footerContent} onHide={() => { if (contactDialogVisible) return setContactDialogVisible(false) }} >
                <ContactContent />
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
