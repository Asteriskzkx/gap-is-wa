import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

interface Props {
  visible: boolean;
  exporting: boolean;
  sections: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function ExportPDFDialog({
  visible,
  exporting,
  sections,
  onChange,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Dialog
      header="เลือกรายงานที่ต้องการส่งออก"
      visible={visible}
      onHide={onClose}
      style={{ width: 450 }}
      footer={
        <div className="flex justify-end gap-2">
          <Button label="ยกเลิก" onClick={onClose} />
          <Button
            label="ส่งออก PDF"
            icon="pi pi-file-pdf"
            onClick={onConfirm}
            disabled={!Object.values(sections).some(Boolean)}
            loading={exporting}
          />
        </div>
      }
    >
      {/* checkboxes here */}
    </Dialog>
  );
}
