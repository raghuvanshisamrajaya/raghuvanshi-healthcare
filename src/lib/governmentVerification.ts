// Government Document Verification Service
// This service provides mock verification for Aadhar and PAN cards
// In production, this would integrate with actual government APIs

interface AadharVerificationResult {
  isValid: boolean;
  name?: string;
  dob?: string;
  address?: string;
  error?: string;
}

interface PANVerificationResult {
  isValid: boolean;
  name?: string;
  category?: string;
  error?: string;
}

export class GovernmentVerificationService {
  private static readonly AADHAR_REGEX = /^\d{4}\s?\d{4}\s?\d{4}$/;
  private static readonly PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  /**
   * Verify Aadhar card number
   * In production, this would call the actual UIDAI API
   */
  static async verifyAadhar(aadharNumber: string): Promise<AadharVerificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean the Aadhar number
    const cleanAadhar = aadharNumber.replace(/\s/g, '');

    // Basic format validation
    if (!this.AADHAR_REGEX.test(aadharNumber)) {
      return {
        isValid: false,
        error: 'Invalid Aadhar number format. Please enter a 12-digit number.'
      };
    }

    // Mock verification logic (in production, this would call UIDAI API)
    const isValid = this.validateAadharChecksum(cleanAadhar);
    
    if (isValid) {
      // Mock verified data (in production, this would come from UIDAI)
      return {
        isValid: true,
        name: 'John Doe', // This would come from UIDAI response
        dob: '01/01/1990',
        address: 'Mock Address from UIDAI'
      };
    } else {
      return {
        isValid: false,
        error: 'Aadhar number verification failed. Please check the number and try again.'
      };
    }
  }

  /**
   * Verify PAN card number
   * In production, this would call the Income Tax Department API
   */
  static async verifyPAN(panNumber: string): Promise<PANVerificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Basic format validation
    if (!this.PAN_REGEX.test(panNumber.toUpperCase())) {
      return {
        isValid: false,
        error: 'Invalid PAN format. Please enter a valid PAN number (e.g., ABCDE1234F).'
      };
    }

    // Mock verification logic (in production, this would call Income Tax API)
    const isValid = this.validatePANStructure(panNumber.toUpperCase());
    
    if (isValid) {
      // Mock verified data (in production, this would come from Income Tax API)
      return {
        isValid: true,
        name: 'John Doe', // This would come from Income Tax response
        category: 'Individual'
      };
    } else {
      return {
        isValid: false,
        error: 'PAN verification failed. Please check the PAN number and try again.'
      };
    }
  }

  /**
   * Validate Aadhar checksum using Verhoeff algorithm
   * This is a simplified version - actual implementation would be more complex
   */
  private static validateAadharChecksum(aadhar: string): boolean {
    // Simplified validation - in reality, Aadhar uses Verhoeff algorithm
    // For demo purposes, we'll accept numbers where the sum of digits is even
    const sum = aadhar.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
    return sum % 2 === 0;
  }

  /**
   * Validate PAN structure
   * Basic validation based on PAN format rules
   */
  private static validatePANStructure(pan: string): boolean {
    // Basic structure validation
    // First 5 characters should be letters
    // Next 4 should be digits
    // Last character should be a letter
    
    const structure = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!structure.test(pan)) return false;

    // Additional validation: 4th character indicates PAN holder type
    const fourthChar = pan[3];
    const validTypes = ['P', 'F', 'A', 'T', 'B', 'C', 'G', 'H', 'L', 'J'];
    
    return validTypes.includes(fourthChar);
  }

  /**
   * Extract information from PAN number
   */
  static extractPANInfo(pan: string): { holderType: string; series: string } {
    const typeMap: { [key: string]: string } = {
      'P': 'Individual',
      'F': 'Firm/LLP',
      'A': 'Association of Persons',
      'T': 'Trust',
      'B': 'Body of Individuals',
      'C': 'Company',
      'G': 'Government',
      'H': 'HUF',
      'L': 'Local Authority',
      'J': 'Artificial Juridical Person'
    };

    const fourthChar = pan[3];
    const holderType = typeMap[fourthChar] || 'Unknown';
    const series = pan.substring(0, 3);

    return { holderType, series };
  }

  /**
   * Format Aadhar number for display
   */
  static formatAadhar(aadhar: string): string {
    const clean = aadhar.replace(/\s/g, '');
    return clean.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
  }

  /**
   * Mask Aadhar number for privacy
   */
  static maskAadhar(aadhar: string): string {
    const clean = aadhar.replace(/\s/g, '');
    return clean.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3');
  }

  /**
   * Check if document verification is enabled
   * In production, this would check API availability
   */
  static isVerificationEnabled(): boolean {
    // For demo purposes, always return true
    // In production, this would check if government APIs are accessible
    return true;
  }

  /**
   * Get verification status message
   */
  static getVerificationMessage(type: 'aadhar' | 'pan'): string {
    if (type === 'aadhar') {
      return 'We verify Aadhar cards through UIDAI (Unique Identification Authority of India) for your security.';
    } else {
      return 'We verify PAN cards through Income Tax Department for compliance and security.';
    }
  }
}

// Export verification functions for easy use
export const verifyAadhar = GovernmentVerificationService.verifyAadhar;
export const verifyPAN = GovernmentVerificationService.verifyPAN;
export const formatAadhar = GovernmentVerificationService.formatAadhar;
export const maskAadhar = GovernmentVerificationService.maskAadhar;
