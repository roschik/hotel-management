import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface PhoneInputProps extends Omit<TextFieldProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, ...props }) => {
  const formatPhoneNumber = (input: string): string => {
    // Удаляем все символы кроме цифр
    const digits = input.replace(/\D/g, '');
    
    // Если начинается с 8, заменяем на 7
    let cleanDigits = digits;
    if (cleanDigits.startsWith('8')) {
      cleanDigits = '7' + cleanDigits.slice(1);
    }
    
    // Если не начинается с 7, добавляем 7
    if (!cleanDigits.startsWith('7')) {
      cleanDigits = '7' + cleanDigits;
    }
    
    // Ограничиваем до 11 цифр (7 + 10 цифр)
    cleanDigits = cleanDigits.slice(0, 11);
    
    // Применяем маску +7-XXX-XXX-XX-XX
    if (cleanDigits.length >= 1) {
      let formatted = '+7';
      if (cleanDigits.length > 1) {
        formatted += '-' + cleanDigits.slice(1, 4);
      }
      if (cleanDigits.length > 4) {
        formatted += '-' + cleanDigits.slice(4, 7);
      }
      if (cleanDigits.length > 7) {
        formatted += '-' + cleanDigits.slice(7, 9);
      }
      if (cleanDigits.length > 9) {
        formatted += '-' + cleanDigits.slice(9, 11);
      }
      return formatted;
    }
    
    return '+7';
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const formattedValue = formatPhoneNumber(inputValue);
    onChange(formattedValue);
  };

  return (
    <TextField
      {...props}
      value={value || '+7'}
      onChange={handleChange}
      placeholder="+7-XXX-XXX-XX-XX"
      inputProps={{
        maxLength: 16, // +7-XXX-XXX-XX-XX = 16 символов
        ...props.inputProps,
      }}
    />
  );
};

export default PhoneInput;