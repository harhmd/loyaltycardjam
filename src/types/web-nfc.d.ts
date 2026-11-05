// Web NFC API declarations for TypeScript (W3C Working Draft)
interface Window {
  NDEFReader?: {
    new (): NDEFReader;
  };
}

interface NDEFScanOptions {
  signal?: AbortSignal;
}

interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

interface NDEFRecordInit {
  recordType: 'empty' | 'text' | 'url' | 'mime' | string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: any;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: DataView;
  toRecords?: () => NDEFRecord[];
}

interface NDEFMessage {
  records: NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  serialNumber: string;
  message: NDEFMessage;
}

declare class NDEFReader extends EventTarget {
  constructor();
  scan(options?: NDEFScanOptions): Promise<void>;
  write(message: NDEFMessageInit | string, options?: NDEFWriteOptions): Promise<void>;
  onreading: ((this: NDEFReader, ev: NDEFReadingEvent) => any) | null;
  onreadingerror: ((this: NDEFReader, ev: Event) => any) | null;
}
