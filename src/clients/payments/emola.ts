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

export async function initiateEmolaPayment(
  input: InitiatePaymentInput
): Promise<InitiatePaymentResult> {
  const { phone, amountCents, currency, reference } = input;
  const baseUrl = process.env.EMOLA_BASE_URL;
  const apiKey = process.env.EMOLA_API_KEY;

  if (!baseUrl || !apiKey) {
    return {
      success: true,
      providerRef: `emola_mock_${Date.now()}`,
      raw: { mocked: true, phone, amountCents, currency, reference },
      message: "e-Mola not configured; returning mocked success.",
    };
  }

  // TODO: Implement real e-Mola integration per provider docs
  return {
    success: true,
    providerRef: `emola_${Date.now()}`,
    raw: { placeholder: true },
  };
}

export async function getEmolaPaymentStatus(providerRef: string): Promise<{
  status: Payment["status"];
  raw?: unknown;
}> {
  const baseUrl = process.env.EMOLA_BASE_URL;
  const apiKey = process.env.EMOLA_API_KEY;

  if (!baseUrl || !apiKey) {
    return { status: "PAID" as Payment["status"], raw: { mocked: true } };
  }

  // TODO: Implement e-Mola status query
  return { status: "PAID" as Payment["status"], raw: { placeholder: true } };
}

