declare module 'bcryptjs' {
  export function hash(s: string, salt: string | number): Promise<string>;
  export function compare(s: string, digest: string): Promise<boolean>;
  export function compareSync(s: string, digest: string): boolean;
  export function hashSync(s: string, salt: string | number): string;
}
