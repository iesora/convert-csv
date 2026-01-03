declare module "encoding-japanese" {
  export interface ConvertOptions {
    to: string;
    from: string;
    type?: string;
  }

  interface Encoding {
    stringToCode(str: string): number[];
    convert(
      data: number[] | Uint8Array | string,
      to: string | ConvertOptions,
      from?: string
    ): number[] | Uint8Array;
  }

  const Encoding: Encoding;
  export default Encoding;
}

