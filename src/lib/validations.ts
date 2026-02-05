import { z } from 'zod/v4';

// Shipping/Checkout form validation schema
export const ShippingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[\p{L}\s'-]+$/u, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  phone: z
    .string()
    .trim()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,20}$/, 'Please enter a valid phone number'),
  
  email: z
    .string()
    .trim()
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal('')),
  
  address: z
    .string()
    .trim()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  method: z.enum(['delivery', 'pickup']),
});

export type ShippingFormData = z.infer<typeof ShippingSchema>;

// Validate shipping form
export function validateShippingForm(data: ShippingFormData): { 
  success: boolean; 
  errors: Record<string, string> 
} {
  // Pre-process email - treat empty string as undefined
  const processedData = {
    ...data,
    email: data.email && data.email.trim() ? data.email : undefined
  };
  
  // Validate email format if provided
  if (processedData.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(processedData.email)) {
      return {
        success: false,
        errors: { email: 'Please enter a valid email address' }
      };
    }
  }
  
  const result = ShippingSchema.safeParse(processedData);
  
  if (result.success) {
    // Additional validation for delivery method
    if (data.method === 'delivery' && (!data.address || data.address.length < 10)) {
      return {
        success: false,
        errors: { address: 'Delivery address is required (min 10 characters)' }
      };
    }
    return { success: true, errors: {} };
  }
  
  const errors: Record<string, string> = {};
  result.error.issues.forEach((err) => {
    const field = err.path[0] as string;
    errors[field] = err.message;
  });
  
  return { success: false, errors };
}

// Contact form validation schema
export const ContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export type ContactFormData = z.infer<typeof ContactSchema>;

// Verification code validation
export const VerificationCodeSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a verification code')
  .max(20, 'Code is too long');

// Review form validation
export const ReviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  userName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  comment: z
    .string()
    .trim()
    .max(1000, 'Comment must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

export type ReviewFormData = z.infer<typeof ReviewSchema>;
