/* eslint-disable no-param-reassign */

import { Schema, Document } from 'mongoose';

const deleteAtPath = (obj: Record<string, unknown>, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index] as string];
    return;
  }
  deleteAtPath(obj[path[index] as string] as Record<string, unknown>, path, index + 1);
};

type SchemaWithOptions = Schema & {
  // TODO(ts-migration): Mongoose schema options typing is too narrow for plugin mutation in v5 typings
  options: {
    toJSON?: {
      transform?: (doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown;
    };
  };
};

// TODO(ts-migration): Schema type parameter kept broad for plugin compatibility with typed schemas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toJSON = (schema: Schema<any>): void => {
  type SchemaWithAnyPath = SchemaWithOptions & {
    // TODO(ts-migration): Mongoose SchemaType options are not fully typed in current defs
    paths: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  const schemaWithAnyPath = schema as SchemaWithAnyPath;
  const schemaWithOptions = schema as SchemaWithOptions;
  let transform: ((doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown) | undefined;
  if (schemaWithOptions.options.toJSON && schemaWithOptions.options.toJSON.transform) {
    transform = schemaWithOptions.options.toJSON.transform;
  }

  schemaWithOptions.options.toJSON = Object.assign(schemaWithOptions.options.toJSON || {}, {
    transform(doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) {
      Object.keys(schemaWithAnyPath.paths).forEach((path) => {
        const schemaPath = schemaWithAnyPath.paths[path];
        if (schemaPath.options && schemaPath.options.private) {
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
