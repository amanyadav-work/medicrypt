'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import clsx from 'clsx';
import { Controller } from 'react-hook-form';

const FormSelect = ({
  name,            // The field name for react-hook-form
  control,         // react-hook-form control object
  label,
  placeholder = "Select an option",
  options = [],
  parentClass = '',
  className = '',
  errors = {},
  disabled = false,
  required = false,
}) => {
  return (
    <div className={clsx('grid w-full gap-1', parentClass)}>
      {label && (
        <Label htmlFor={name} className="pb-1">
          {label}{required ? '*' : ''}
        </Label>
      )}

      <Controller
        control={control}
        name={name}
        rules={{ required }}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={field.value || ''}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className={clsx(
                'peer w-full text-sm',
                errors[name] ? 'border-[#A90F26]' : '',
                className
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {errors[name] && (
        <p className="text-xs text-red-800" role="alert">
          {errors[name]?.message || 'This field is required'}
        </p>
      )}
    </div>
  );
};

export default FormSelect;
