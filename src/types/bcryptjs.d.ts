declare module 'bcryptjs' {
  export function compare(s: string, hash: string): Promise<boolean>;
  export function hash(s: string, salt: string | number): Promise<string>;

  const bcrypt: {
    compare: typeof compare;
    hash: typeof hash;
  };

  export default bcrypt;
}
