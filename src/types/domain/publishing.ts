import type { FileKind } from './file';

export type UploadStatus = 'uploading' | 'done' | 'error';

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  loaded: number;
  kind: FileKind;
  status: UploadStatus;
  error?: string;
  source: 'file' | 'url';
};
