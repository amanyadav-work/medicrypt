'use client';
import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import { Textarea } from "./textarea";

const FormField = ({
  id,
  label,
  placeholder,
  register,
  icon,
  parentClass = "",
  errors = {},
  className = "",
  isSecret = false,
  isTextArea = false,
  hasEndIcon = false,
  endChildren,
  endProps,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const inputType = useMemo(() => (isSecret ? (isVisible ? "text" : "password") : "text"), [isSecret, isVisible]);

  return (
    <div className={clsx("grid w-full gap-1", parentClass)}>
      {label && <Label htmlFor={id} className='pb-1'>{label}</Label>}

      <div className="relative w-full ">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground peer-focus:text-foreground">
            {icon}
          </div>
        )}

        {isSecret && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-muted-foreground peer-focus:text-foreground"
            onClick={() => setIsVisible(prev => !prev)}
            aria-label="Toggle password visibility"
          >
            {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
          </div>
        )}


        {hasEndIcon && (
          <div
            className="absolute peer-focus:text-foreground inset-y-0 right-3 pr-1 flex items-center cursor-pointer"
            {...endProps}
          >
            {endChildren}
          </div>
        )}

        {isTextArea ? (
          <Textarea
            id={id}
            placeholder={placeholder}
            {...(register ? register(id) : {})}
            className={clsx(
              "peer w-full text-sm",
              icon ? "pl-9" : "pl-3",
              errors[id] ? "border-[#A90F26]" : "",
              className
            )}
            {...props}
          />
        ) : (
          <Input
            id={id}
            type={inputType}
            placeholder={placeholder}
            {...(register ? register(id) : {})}
            className={clsx(
              "peer w-full text-sm",
              icon ? "pl-9" : "pl-3",
              errors[id] ? "border-[#A90F26]" : "",
              className
            )}
            {...props}
          />
        )}



      </div>

      {errors[id] && (
        <p className="text-xs text-red-800" role="alert">
          {errors[id]?.message}
        </p>
      )}
    </div>
  );
};

export default FormField;