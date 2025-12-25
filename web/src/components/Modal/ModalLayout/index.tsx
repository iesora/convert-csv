import React, { ReactNode, useState } from "react";
import { Button, Modal } from "antd";
import { anBlue } from "@/utils/colors";

interface ModalLayoutProps {
  isOpen: boolean;
  handleClose: () => void;
  title: string;
  okText?: string;
  onOk?: () => void;
  footer?: null;
  isLarge?: boolean;
  deleteButton?: boolean;
  onDelete?: () => void;
  isDisplayOkButton?: boolean;
  children: ReactNode;
}

const ModalLayout: React.FC<ModalLayoutProps> = ({
  isOpen,
  handleClose,
  title,
  okText,
  onOk,
  footer,
  children,
  isLarge,
  deleteButton,
  onDelete,
  isDisplayOkButton = true,
}) => {
  // 削除ボタンのホバー状態をトラッキング
  const [isHovered, setIsHovered] = useState(false);

  const renderFooter =
    footer === undefined ? (
      <div style={{ textAlign: "right" }}>
        <Button onClick={handleClose} style={{ marginRight: "8px" }}>
          閉じる
        </Button>
        {deleteButton && (
          <Button
            onClick={() => {
              onDelete && onDelete();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              marginRight: "8px",
              borderColor: isHovered ? "#f87979" : "red",
              color: isHovered ? "#f87979" : "red",
            }}
          >
            削除
          </Button>
        )}
        {isDisplayOkButton && (
          <Button
            type="primary"
            onClick={onOk}
            style={{
              marginRight: "8px",
              backgroundColor: anBlue,
              borderColor: anBlue,
            }}
          >
            {okText || "完了"}
          </Button>
        )}
      </div>
    ) : (
      footer
    );
  return (
    <Modal
      title={title}
      okText={okText}
      onOk={onOk}
      open={isOpen}
      onCancel={handleClose}
      footer={renderFooter}
      width={isLarge ? "95%" : 1000}
      styles={{ body: { height: isLarge ? "80vh" : "auto" } }}
      centered={isLarge}
    >
      <div
        style={{ marginBottom: "8px", borderTop: "1px solid lightgray" }}
      ></div>
      <div style={{ maxHeight: isLarge ? "80vh" : "60vh", overflowY: "auto" }}>
        {children}
      </div>
    </Modal>
  );
};

export default ModalLayout;
