import { NextRequest, NextResponse } from 'next/server';
import { 
  sendWhatsAppMessage, 
  validateTwilioSignature, 
  parseTwilioWebhook,
  extractPhoneNumber 
} from '@/lib/twilio';
import { processCommand } from '@/lib/whatsapp-commands';

// Twilio sends POST requests with form data
export async function POST(request: NextRequest) {
  try {
    // Get the raw form data
    const formData = await request.formData();
    
    // Validate Twilio signature for security
    const signature = request.headers.get('x-twilio-signature') || '';
    const url = request.url;
    
    // Convert FormData to object for validation
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    // In production, validate the signature
    if (process.env.NODE_ENV === 'production') {
      const isValid = validateTwilioSignature(signature, url, params);
      if (!isValid) {
        console.error('Invalid Twilio signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }
    
    // Parse the webhook body
    const webhookBody = parseTwilioWebhook(formData);
    const { From, Body, ProfileName } = webhookBody;
    
    console.log(`WhatsApp message from ${ProfileName || From}: ${Body}`);
    
    // Process the command and get response
    const phoneNumber = extractPhoneNumber(From);
    const response = await processCommand(phoneNumber, Body);
    
    // Send the response back via WhatsApp
    await sendWhatsAppMessage(From, response);
    
    // Return TwiML empty response (Twilio expects this)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    
    // Still return 200 to prevent Twilio from retrying
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}

// Twilio also sends GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'WhatsApp webhook endpoint active',
    timestamp: new Date().toISOString(),
  });
}
