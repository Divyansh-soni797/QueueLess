import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { AppError } from "../utils/AppError.js";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
    throw new Error("Razorpay API keys are missing from backend/.env");
}

export const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
});

export const razorpayService = {
    async createOrder(amountInRupees: number, receipt: string) {
        if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
            throw new AppError(400, "INVALID_AMOUNT", "Invalid payment amount.");
        }

        return razorpay.orders.create({
            amount: Math.round(amountInRupees * 100),
            currency: "INR",
            receipt,
        });
    },
    async fetchPayment(paymentId: string) {
        return razorpay.payments.fetch(paymentId);
    },

    verifyPaymentSignature(
        razorpayOrderId: string,
        razorpayPaymentId: string,
        signature: string,
    ): boolean {
        const expected = createHmac("sha256", keySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expected, "hex");
        const receivedBuffer = Buffer.from(signature, "hex");

        return (
            expectedBuffer.length === receivedBuffer.length &&
            timingSafeEqual(expectedBuffer, receivedBuffer)
        );
    },
};