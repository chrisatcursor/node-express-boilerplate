import { Document, Schema, ToObjectOptions } from 'mongoose';

type PlainObject = Record<string, unknown>;
type TransformFunction = (doc: unknown, ret: PlainObject, options: ToObjectOptions) => unknown;
type SchemaTypeWithPrivateOption = {
  options?: {
    private?: boolean;
  };
};

const deleteAtPath = (object: PlainObject, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete object[path[index]];
    return;
  }

  const value = object[path[index]];

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    deleteAtPath(value as PlainObject, path, index + 1);
  }
};

const toJSON = <T extends Document>(schema: Schema<T>): void => {
  const schemaOptions = schema.get('toJSON') as ToObjectOptions | undefined;
  const existingTransform = schemaOptions?.transform as TransformFunction | undefined;

  schema.set('toJSON', {
    ...schemaOptions,
    transform(doc: unknown, ret: PlainObject, options: ToObjectOptions) {
      schema.eachPath((pathname, schemaType) => {
        const schemaTypeOptions = schemaType as typeof schemaType & SchemaTypeWithPrivateOption;

        if (schemaTypeOptions.options?.private) {
          deleteAtPath(ret, pathname.split('.'), 0);
        }
      });

      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      if (existingTransform) {
        return existingTransform(doc, ret, options);
      }

      return ret;
    },
  });
};

export default toJSON;
