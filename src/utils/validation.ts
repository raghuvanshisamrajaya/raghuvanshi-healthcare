// Validation utilities for form inputs

export const validateEmail = (email: string): { isValid: boolean; message: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  // Basic email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  // Additional checks for common email patterns
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];
  const domain = email.split('@')[1];
  
  if (domain && domain.includes('..')) {
    return { isValid: false, message: 'Email domain contains consecutive dots' };
  }

  return { isValid: true, message: '' };
};

export const validatePhone = (phone: string): { isValid: boolean; message: string } => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }

  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');

  // Indian phone number validation
  if (cleanPhone.length < 10) {
    return { isValid: false, message: 'Phone number must be at least 10 digits' };
  }

  if (cleanPhone.length > 12) {
    return { isValid: false, message: 'Phone number cannot exceed 12 digits' };
  }

  // Indian mobile number patterns
  const indianMobileRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
  
  if (!indianMobileRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter a valid Indian phone number (starting with 6-9)' };
  }

  return { isValid: true, message: '' };
};

export const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, message: 'Name cannot exceed 50 characters' };
  }

  // Check for valid name characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  
  if (!nameRegex.test(name)) {
    return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true, message: '' };
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Password cannot exceed 128 characters' };
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return { isValid: false, message: 'Password must contain at least one letter and one number' };
  }

  return { isValid: true, message: '' };
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Format as Indian phone number
  if (cleanPhone.length >= 10) {
    const formatted = cleanPhone.slice(-10);
    return `+91 ${formatted.slice(0, 5)} ${formatted.slice(5)}`;
  }
  
  return phone;
};

export const formatEmailForDisplay = (email: string): string => {
  return email.toLowerCase().trim();
};
