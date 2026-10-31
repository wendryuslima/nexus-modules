import { useEffect, useRef } from "react";

const ImageAttachmentPreview = ({ file }: { file: File }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const objectUrl = URL.createObjectURL(file);
    image.src = objectUrl;
    return () => { image.removeAttribute("src"); URL.revokeObjectURL(objectUrl); };
  }, [file]);
  return <img ref={imageRef} alt="Prévia da imagem selecionada" className="size-16 rounded object-cover" />;
};

export { ImageAttachmentPreview };
