/* eslint-disable no-param-reassign */

import { Schema, Document } from 'mongoose';

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
  const schemaWithOptions = schema as Schema<any> & {
    options: {
      toJSON?: {
        transform?: (doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown;
      };
    };
  };
  let transform: ((doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown) | undefined;
  if (schemaWithOptions.options.toJSON && schemaWithOptions.options.toJSON.transform) {
    transform = schemaWithOptions.options.toJSON.transform as typeof transform;
  }

  schemaWithOptions.options.toJSON = Object.assign(schemaWithOptions.options.toJSON || {}, {
    transform(doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) {
      Object.keys(schema.paths).forEach((path) => {
        // TODO(ts-migration): Mongoose SchemaType does not expose options in its public typedef
        const schemaPath = schema.paths[path] as unknown as { options: { private?: boolean } };
        if (schemaPath.options.private) {
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
