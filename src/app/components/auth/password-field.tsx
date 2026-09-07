import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordFieldProps = {
  id: string;
  label?: string;
  placeholder: string;
  autoComplete: string;
  required?: boolean;
};

const PasswordField = ({
  id,
  label,
  placeholder,
  autoComplete,
  required = false,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="h-[clamp(2.5rem,6vh,3rem)] pr-11"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={isVisible}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          {isVisible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
    </div>
  );
};

export default PasswordField;
