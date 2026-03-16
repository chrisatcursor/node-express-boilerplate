const pick = <T extends object, K extends keyof T>(object: T, keys: readonly K[]): Partial<Pick<T, K>> => {
  const pickedObject: Partial<Pick<T, K>> = {};

  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      pickedObject[key] = object[key];
    }
  });

  return pickedObject;
};

export default pick;
