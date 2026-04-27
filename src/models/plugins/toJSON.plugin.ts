/* eslint-disable no-param-reassign */

import { Schema, Document } from 'mongoose';

interface ToJSONSchemaOptions {
  toJSON?: {
    transform?: (doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown;
  };
}

const deleteAtPath = (obj: Record<string, unknown>, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index] as string];
    return;
  }
  deleteAtPath(obj[path[index] as string] as Record<string, unknown>, path, index + 1);
};

// TODO(ts-migration): Schema type parameter kept as base Schema for plugin compatibility with typed schemas
const toJSON = (schema: Schema<any>): void => {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  let transform: ((doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown) | undefined;
  const schemaOptions = schema as unknown as ToJSONSchemaOptions;
  if (schemaOptions.toJSON && schemaOptions.toJSON.transform) {
    transform = schemaOptions.toJSON.transform;
  }

  schemaOptions.toJSON = Object.assign(schemaOptions.toJSON || {}, {
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
