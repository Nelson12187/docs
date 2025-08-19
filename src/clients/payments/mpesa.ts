import type { Payment } from "@prisma/client";

export interface InitiatePaymentInput {
  phone: string;
  amountCents: number;
  currency: string;
  reference: string;
}

export interface InitiatePaymentResult {
  success: boolean;
  providerRef?: string;
  raw?: unknown;
  message?: string;
}

export async function initiateMpesaPayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  const { phone, amountCents, currency, reference } = input;
  const baseUrl = process.env.MPESA_BASE_URL;
  const apiKey = process.env.MPESA_API_KEY;
  const publicKey = process.env.MPESA_PUBLIC_KEY;

  if (!baseUrl || !apiKey || !publicKey) {
    return {
      success: true,
      providerRef: `mpesa_mock_${Date.now()}`,
      raw: { mocked: true, phone, amountCents, currency, reference },
      message: "M-Pesa not configured; returning mocked success.",
    };
  }

  // TODO: Implement real M-Pesa integration per provider docs
  // Placeholder: return mocked success to keep flow working in development
  return {
    success: true,
    providerRef: `mpesa_${Date.now()}`,
    raw: { placeholder: true },
  };
}

export async function getMpesaPaymentStatus(providerRef: string): Promise<{
  status: Payment["status"];
  raw?: unknown;
}> {
  const baseUrl = process.env.MPESA_BASE_URL;
  const apiKey = process.env.MPESA_API_KEY;

  if (!baseUrl || !apiKey) {
    return { status: "PAID" as Payment["status"], raw: { mocked: true } };
  }

  // TODO: Implement M-Pesa status query
  return { status: "PAID" as Payment["status"], raw: { placeholder: true } };
}

