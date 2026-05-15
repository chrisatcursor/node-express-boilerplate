declare module 'bcryptjs' {
  function compare(s: string, hash: string): Promise<boolean>;
  function hash(s: string, salt: string | number): Promise<string>;

  export { compare, hash };
}
