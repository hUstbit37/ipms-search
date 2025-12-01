"use client"

import { InputHTMLAttributes } from "react"
import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import { EyeIcon, EyeOff } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  autoComplete?: "current-password" | "new-password"
}

export function InputPassword(props: Props) {
  return (
    <PasswordToggleField.Root>
      <div className="relative w-full h-full">
        <PasswordToggleField.Input
          { ...props }
          className={`placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ${props.className}`}/>
        <PasswordToggleField.Toggle className="absolute top-2.5 right-2">
          <PasswordToggleField.Icon
            visible={ <EyeIcon size={ 15 }/> }
            hidden={ <EyeOff size={ 15 }/> }
          />
        </PasswordToggleField.Toggle>
      </div>
    </PasswordToggleField.Root>
  )
}
