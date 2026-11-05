// Web NFC Utilities for Jualan Agro MADANI Loyalty Card System

export interface ParsedNfcPayload {
  raw: string;
  serialNumber?: string;
  type: 'MEMBER_CARD' | 'STALL_TAG' | 'URL' | 'UNKNOWN';
  memberId?: string;
  cardId?: string;
  sellerId?: string;
  metadata?: Record<string, any>;
}

/**
 * Check if the current browser and hardware environment supports Web NFC.
 * Web NFC is supported in Chromium browsers (Android) on HTTPS.
 */
export const isWebNfcSupported = (): boolean => {
  return typeof window !== 'undefined' && 'NDEFReader' in window;
};

/**
 * Provide subtle haptic feedback on devices with vibration support (like Android phones during NFC tap).
 */
export const triggerNfcHaptic = (type: 'tap' | 'success' | 'error' = 'tap') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'tap') {
        navigator.vibrate(60);
      } else if (type === 'success') {
        navigator.vibrate([40, 60, 120]);
      } else if (type === 'error') {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Ignore vibration error if not permitted
    }
  }
};

/**
 * Decode an NDEFRecord into readable UTF-8 text string.
 */
export const decodeNdefRecord = (record: NDEFRecord): string => {
  if (!record.data) return '';
  try {
    const textDecoder = new TextDecoder(record.encoding || 'utf-8');
    return textDecoder.decode(record.data);
  } catch (err) {
    console.warn('Failed to decode NDEF record:', err);
    return '';
  }
};

/**
 * Parse any raw NFC tag text payload into structured Agro MADANI objects.
 * Supports:
 * 1. Member card payloads: "JAM-CARD:MEM-001:JAM-MY-88219" or "MEM-001"
 * 2. Stall merchant tags: "JAM-MERCHANT:STALL-001" or "STALL-001"
 * 3. JSON payloads: {"type":"JAM_CARD","memberId":"MEM-001"}
 * 4. URLs: https://loyaltycardjam.../?stall=STALL-001
 */
export const parseNfcPayload = (
  rawText: string,
  serialNumber?: string
): ParsedNfcPayload => {
  const text = (rawText || '').trim();

  // 1. JSON parsing check
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.type === 'JAM_CARD' || parsed.memberId) {
        return {
          raw: text,
          serialNumber,
          type: 'MEMBER_CARD',
          memberId: parsed.memberId,
          cardId: parsed.cardId,
          metadata: parsed,
        };
      }
      if (parsed.type === 'JAM_MERCHANT' || parsed.sellerId) {
        return {
          raw: text,
          serialNumber,
          type: 'STALL_TAG',
          sellerId: parsed.sellerId,
          metadata: parsed,
        };
      }
    } catch {
      // Continue to regex checks
    }
  }

  // 2. Member card prefix: "JAM-CARD:MEM-001:JAM-MY-88219"
  if (text.startsWith('JAM-CARD:')) {
    const parts = text.split(':');
    return {
      raw: text,
      serialNumber,
      type: 'MEMBER_CARD',
      memberId: parts[1] || 'MEM-001',
      cardId: parts[2] || undefined,
    };
  }

  // 3. Merchant Stall prefix: "JAM-MERCHANT:STALL-001"
  if (text.startsWith('JAM-MERCHANT:')) {
    const parts = text.split(':');
    return {
      raw: text,
      serialNumber,
      type: 'STALL_TAG',
      sellerId: parts[1] || 'STALL-001',
    };
  }

  // 4. Raw IDs: MEM-xxx or STALL-xxx
  if (text.startsWith('MEM-')) {
    return {
      raw: text,
      serialNumber,
      type: 'MEMBER_CARD',
      memberId: text,
    };
  }
  if (text.startsWith('STALL-')) {
    return {
      raw: text,
      serialNumber,
      type: 'STALL_TAG',
      sellerId: text,
    };
  }

  // 5. URL parsing: e.g. https://...?stall=STALL-001
  if (text.startsWith('http://') || text.startsWith('https://')) {
    try {
      const url = new URL(text);
      const stall = url.searchParams.get('stall');
      const member = url.searchParams.get('member');
      if (stall) {
        return {
          raw: text,
          serialNumber,
          type: 'STALL_TAG',
          sellerId: stall,
        };
      }
      if (member) {
        return {
          raw: text,
          serialNumber,
          type: 'MEMBER_CARD',
          memberId: member,
        };
      }
      return {
        raw: text,
        serialNumber,
        type: 'URL',
      };
    } catch {
      // Fallback
    }
  }

  return {
    raw: text,
    serialNumber,
    type: 'UNKNOWN',
  };
};

/**
 * Start scanning using the hardware Web NFC NDEFReader.
 * Returns an AbortController so the scan can be stopped when modal closes.
 */
export const startWebNfcScan = async (
  onReading: (payload: ParsedNfcPayload, event: NDEFReadingEvent) => void,
  onError: (error: Error) => void
): Promise<AbortController | null> => {
  if (!isWebNfcSupported()) {
    onError(new Error('Web NFC tidak disokong pada pelayar atau peranti ini.'));
    return null;
  }

  try {
    const abortController = new AbortController();
    const ndef = new (window as any).NDEFReader();

    await ndef.scan({ signal: abortController.signal });

    ndef.onreading = (event: NDEFReadingEvent) => {
      triggerNfcHaptic('tap');
      let combinedText = '';
      for (const record of event.message.records) {
        const text = decodeNdefRecord(record);
        if (text) {
          combinedText += text;
        }
      }

      const parsed = parseNfcPayload(combinedText, event.serialNumber);
      onReading(parsed, event);
    };

    ndef.onreadingerror = (ev: Event) => {
      triggerNfcHaptic('error');
      console.warn('Ralat membaca kad NFC:', ev);
      onError(new Error('Gagal membaca data dari kad NFC. Sila pastikan kad didekatkan dengan betul.'));
    };

    return abortController;
  } catch (err: any) {
    onError(err instanceof Error ? err : new Error(String(err)));
    return null;
  }
};

/**
 * Write a formatted string payload to a physical NFC card or tag.
 */
export const writeWebNfcTag = async (
  payloadText: string,
  abortSignal?: AbortSignal
): Promise<{ success: boolean; message: string }> => {
  if (!isWebNfcSupported()) {
    return {
      success: false,
      message: 'Web NFC tidak disokong pada peranti atau pelayar ini.',
    };
  }

  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.write(
      {
        records: [
          {
            recordType: 'text',
            data: payloadText,
            encoding: 'utf-8',
          },
        ],
      },
      { signal: abortSignal }
    );
    triggerNfcHaptic('success');
    return {
      success: true,
      message: `Kad NFC berjaya dirakap dengan rekod: ${payloadText}`,
    };
  } catch (err: any) {
    triggerNfcHaptic('error');
    const msg =
      err?.name === 'NotAllowedError'
        ? 'Kebenaran NFC ditolak oleh pengguna.'
        : err?.name === 'NotSupportedError'
        ? 'Peranti atau format tag tidak menyokong penulisan NDEF.'
        : err?.message || 'Ralat semasa menulis ke kad NFC.';
    return { success: false, message: msg };
  }
};
