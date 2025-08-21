"use server";

import twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendWhatsapp({ phone, message, img }) {
    try {
        let data = {
            from: "whatsapp:+14155238886",
            to: `whatsapp:+91${phone}`,
            body: message,
        };
        if (img) {
            data.mediaUrl = img;
        }
        const result = await client.messages.create(data);
        console.log("Whatsapp message sent successfully: " + result);
        return {
      success: true,
    };
    } catch (error) {
        console.error("Error sending WhatsApp message: ", error);
        throw error;
    }
}