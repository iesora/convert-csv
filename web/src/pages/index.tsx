import React, { useState } from "react";
import PageLayout from "@/components/common/PageLayout";
import { Upload, Button, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { textColor, subTextColor } from "@/utils/colors";
import { axiosInstance } from "@/utils/url";

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const { Dragger } = Upload;

  const handleUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      axiosInstance
        .post("/payslip/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          message.success("ファイルが正常にアップロードされました");
        })
        .catch((error) => {
          message.error("ファイルのアップロードに失敗しました");
        });
    } else {
      message.warning("ファイルを選択してください");
    }
  };

  const props = {
    name: "file",
    multiple: false,
    accept: ".xlsx",
    beforeUpload: (file: File) => {
      setFile(file);
      return false;
    },
  };

  return (
    <PageLayout>
      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            fontSize: "26px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: textColor,
          }}
        >
          Excelアップロードフォーム
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          minWidth: "300px",
          flexDirection: "column",
        }}
      >
        <Dragger {...props}>
          <div
            style={{
              width: "500px",
              height: "200px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InboxOutlined
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "#d9d9d9",
              }}
            />
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: textColor,
                marginBottom: "8px",
              }}
            >
              Excelファイルをアップロード
            </div>
            <div style={{ color: subTextColor, fontSize: "14px" }}>
              ここにExcelファイルをドラッグするか、クリックして選択してください
            </div>
          </div>
        </Dragger>
        <Button
          type="primary"
          onClick={handleUpload}
          //   onClick={() => {
          //     console.log(file);
          //   }}
          style={{ marginTop: "20px" }}
        >
          アップロード
        </Button>
      </div>
    </PageLayout>
  );
};

export default Index;
