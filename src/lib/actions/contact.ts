"use server";

export async function sendContactEmailAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  // TODO: Implement actual email sending logic
  return { ok: true };
}
