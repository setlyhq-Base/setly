// Form validation helpers
export function isRequired(value: any): boolean {
  return value !== null && value !== undefined && value !== '';
}

export function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function minLength(length: number) {
  return (value: string) => value.length >= length;
}

export function maxLength(length: number) {
  return (value: string) => value.length <= length;
}

// Form state helpers
export interface FormField<T = any> {
  value: T;
  error: string | null;
  touched: boolean;
}

export function createFormField<T>(initialValue: T): FormField<T> {
  return {
    value: initialValue,
    error: null,
    touched: false
  };
}

export function validateField<T>(
  field: FormField<T>,
  validators: ((value: T) => string | null)[]
): FormField<T> {
  for (const validator of validators) {
    const error = validator(field.value);
    if (error) {
      return { ...field, error };
    }
  }
  return { ...field, error: null };
}
