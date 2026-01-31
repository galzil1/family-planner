import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

// Create Twilio client (lazy initialization for serverless)
let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<string> {
  const client = getTwilioClient();
  
  // Ensure the 'to' number has whatsapp: prefix
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  
  const message = await client.messages.create({
    body,
    from: whatsappNumber,
    to: toNumber,
  });
  
  return message.sid;
}

// Validate Twilio webhook signature for security
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  if (!authToken) {
    console.warn('TWILIO_AUTH_TOKEN not set, skipping signature validation');
    return true; // Skip validation in development
  }
  
  return twilio.validateRequest(authToken, signature, url, params);
}

// Parse incoming Twilio webhook body
export interface TwilioWebhookBody {
  From: string;        // whatsapp:+972XXXXXXXXX
  To: string;          // whatsapp:+14155238886
  Body: string;        // Message text
  MessageSid: string;  // Unique message ID
  ProfileName?: string; // WhatsApp profile name
  NumMedia?: string;   // Number of media attachments
}

export function parseTwilioWebhook(formData: FormData): TwilioWebhookBody {
  return {
    From: formData.get('From') as string || '',
    To: formData.get('To') as string || '',
    Body: formData.get('Body') as string || '',
    MessageSid: formData.get('MessageSid') as string || '',
    ProfileName: formData.get('ProfileName') as string || undefined,
    NumMedia: formData.get('NumMedia') as string || undefined,
  };
}

// Extract phone number without whatsapp: prefix
export function extractPhoneNumber(whatsappNumber: string): string {
  return whatsappNumber.replace('whatsapp:', '');
}
