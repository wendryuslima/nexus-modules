import { Search, X } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchFieldProps = { name: "q" | "messageQuery"; label: string; autoFocus?: boolean; clearable?: boolean };

const SearchField = ({ name, label, autoFocus, clearable = true }: SearchFieldProps) => {
  const [params, setParams] = useSearchParams();
  const submitted = params.get(name) ?? "";
  const [draft, setDraft] = useState({ submitted, value: submitted });
  if (draft.submitted !== submitted) setDraft({ submitted, value: submitted });
  const update = (nextValue: string) => setParams((current) => {
    const next = new URLSearchParams(current);
    if (nextValue) next.set(name, nextValue); else next.delete(name);
    return next;
  }, { replace: true });

  return <form role="search" aria-label={label} className="relative flex items-center gap-1" onSubmit={(event) => {
    event.preventDefault();
    update(draft.value.trim());
  }}>
    <Search aria-hidden="true" className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
    <Input autoFocus={autoFocus} type="text" role="searchbox" enterKeyHint="search" autoComplete="off" name={name} aria-label={label} placeholder={label} maxLength={200}
      className={clearable ? "pl-9 pr-9" : "pl-9"} value={draft.value} onChange={(event) => setDraft({ submitted, value: event.target.value })} />
    {clearable && (draft.value || submitted) && <Button type="button" variant="ghost" size="icon-sm" className="absolute right-1" aria-label={`Limpar ${label.toLocaleLowerCase("pt-BR")}`} onClick={() => {
      setDraft({ submitted, value: "" });
      update("");
    }}><X aria-hidden="true" className="size-4" /></Button>}
  </form>;
};

export { SearchField };
