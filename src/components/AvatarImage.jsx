import { useEffect, useState } from "react";

export default function AvatarImage({ src, file, name, alt = "", className }) {
  const [failed, setFailed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    setFailed(false);
  }, [src, file]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const imageUrl = previewUrl || src;
  if (!imageUrl || failed) return <span className={className} aria-label={`${name || "사용자"} 기본 프로필`}>{name?.slice(0, 1) || "-"}</span>;
  return <img className={className} src={imageUrl} alt={alt} onError={() => setFailed(true)} />;
}
