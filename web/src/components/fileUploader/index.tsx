import React, { useState, useCallback } from "react";
import Image from "next/image";
import CropModal from "../../components/Modal/crop";

interface FileUploaderProps {
  url?: string;
  aspect: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ aspect, url }) => {
  /** アップロードした画像URL */
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  /** 切り取ったあとの画像URL */
  const [croppedImgSrc, setCroppedImgSrc] = useState<string | undefined>("");

  const [zoom, setZoom] = useState(1);

  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          if (reader.result) {
            setImgSrc(reader.result.toString() || "");
          }
        });
        reader.readAsDataURL(e.target.files[0]);
      }
    },
    []
  );

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <input type="file" onChange={onFileChange} />
      </div>
      {imgSrc && (
        <CropModal
          isOpen={imgSrc !== undefined}
          onClose={() => {
            setImgSrc(undefined);
          }}
          imgSrc={imgSrc}
          setCroppedImgSrc={setCroppedImgSrc}
          zoom={zoom}
          setZoom={setZoom}
          crop={crop}
          setCrop={setCrop}
          aspect={aspect}
        />
      )}
      {croppedImgSrc && (
        <Image src={croppedImgSrc} width={200} height={200} alt="cropped" />
      )}
      {url !== undefined && croppedImgSrc !== undefined && (
        <>
          <Image src={url} width={200} height={200} alt="cropped" />
        </>
      )}
    </div>
  );
};

export default FileUploader;
