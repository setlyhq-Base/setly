declare module 'heic2any' {
  const heic2any: (options: { blob: Blob; toType?: string; quality?: number }) => Promise<Blob | Blob[]>;
  export = heic2any;
}
