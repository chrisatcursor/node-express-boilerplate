declare module 'faker' {
  interface FakerStatic {
    name: {
      findName(): string;
    };
    internet: {
      email(): string;
    };
  }

  const faker: FakerStatic;
  export default faker;
}
