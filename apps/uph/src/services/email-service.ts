
export const emailService = {
  sendInvoiceReminder: async (invoiceId: string, email: string) => {
    // In a real application, this would make an API call to SendGrid, AWS SES, etc.
    console.log(`[EmailService] Sending invoice reminder for ${invoiceId} to ${email}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, messageId: crypto.randomUUID() };
  },
  
  sendWelcomeEmail: async (email: string, name: string) => {
    console.log(`[EmailService] Sending welcome email to ${name} (${email})`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }
};
