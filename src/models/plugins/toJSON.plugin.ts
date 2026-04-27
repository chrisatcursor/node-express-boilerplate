/* eslint-disable no-param-reassign */

import { Schema, Document, SchemaOptions } from 'mongoose';

interface SchemaWithMutableToJSONOptions {
  options: SchemaOptions & {
    toJSON?: {
      transform?: (doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown;
    };
  };
}

const deleteAtPath = (obj: Record<string, unknown>, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index] as string];
    return;
  }
  deleteAtPath(obj[path[index] as string] as Record<string, unknown>, path, index + 1);
};

const toJSON = <T extends Document>(schema: Schema<T>): void => {
  const schemaWithOptions = schema as unknown as SchemaWithMutableToJSONOptions;
  let transform: ((doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown) | undefined;
  if (schemaWithOptions.options.toJSON && schemaWithOptions.options.toJSON.transform) {
    transform = schemaWithOptions.options.toJSON.transform;
  }

  schemaWithOptions.options.toJSON = Object.assign(schemaWithOptions.options.toJSON || {}, {
    transform(doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) {
      Object.keys(schema.paths).forEach((path) => {
        // TODO(ts-migration): Mongoose SchemaType does not expose options in its public typedef
        const schemaPath = schema.paths[path] as any; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (schemaPath?.options?.private) {
          deleteAtPath(ret, path.split('.'), 0);
        }
      });

      ret.id = (ret._id as { toString(): string }).toString();
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      if (transform) {
        return transform(doc, ret, options);
      }
    },
  });
};

export default toJSON;
