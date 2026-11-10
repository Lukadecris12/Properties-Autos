/**
 * Paystack Web Integration Helper for Properties & Autos
 * Handles loading of the Paystack Inline JS popup and checkout flows.
 */

export interface PaystackPaymentConfig {
  key?: string;
  email: string;
  amount: number; // in Naira (will be converted to kobo)
  currency?: string;
  ref: string;
  channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
  metadata?: Record<string, any>;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

export function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }
    if ((window as any).PaystackPop) {
      return resolve(true);
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openPaystackPopup(config: PaystackPaymentConfig): Promise<boolean> {
  const loaded = await loadPaystackScript();
  if (!loaded || !(window as any).PaystackPop) {
    console.error('Paystack Inline JS failed to load.');
    return false;
  }

  const publicKey = config.key || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_df5866fa80860e7b79e3fb9e3cfd1e91a2116240';
  const amountKobo = Math.round(config.amount * 100);

  const handler = (window as any).PaystackPop.setup({
    key: publicKey,
    email: config.email,
    amount: amountKobo,
    currency: config.currency || 'NGN',
    ref: config.ref,
    metadata: config.metadata || {},
    callback: function (response: { reference: string; status?: string }) {
      config.onSuccess(response.reference);
    },
    onClose: function () {
      if (config.onClose) {
        config.onClose();
      }
    },
  });

  handler.openIframe();
  return true;
}
