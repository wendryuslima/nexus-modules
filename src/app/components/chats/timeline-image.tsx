import { useState } from "react";
import { ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageAccess } from "@/hooks/images/use-image-access";

type TimelineImageProps = { imageId: string; caption?: string };

const TimelineImage = ({ imageId, caption }: TimelineImageProps) => {
  const access = useImageAccess(imageId);
  const [failedUrl, setFailedUrl] = useState<string>();
  const failed = access.data && failedUrl === access.data.url;

  if (access.isPending) return <div role="status" className="flex h-40 w-64 items-center justify-center gap-2 rounded bg-muted text-muted-foreground"><ImageIcon aria-hidden="true" />Carregando imagem...</div>;

  if (access.error || failed) return (
    <div className="max-w-64 space-y-2 rounded bg-muted p-3">
      <p role="alert" className="text-xs text-destructive">{access.error?.message ?? "Não foi possível carregar a imagem."}</p>
      <Button type="button" size="sm" variant="outline" disabled={access.isFetching} onClick={async () => {
        const result = await access.refetch();
        if (result.isSuccess) setFailedUrl(undefined);
      }}><RefreshCw aria-hidden="true" />Tentar novamente</Button>
    </div>
  );

  if (!access.data) return null;
  const image = access.data;
  return (
    <a href={image.url} target="_blank" rel="noopener noreferrer" aria-label="Abrir imagem em tamanho original">
      <img src={image.url} alt={caption || "Imagem compartilhada na conversa"} width={image.width} height={image.height}
        loading="lazy" referrerPolicy="no-referrer" className="max-h-96 max-w-full rounded object-contain sm:max-w-80"
        onError={() => {
          setFailedUrl(image.url);
          if (Date.parse(image.expiresAt) <= Date.now()) void access.refetch();
        }} />
    </a>
  );
};

export { TimelineImage };
