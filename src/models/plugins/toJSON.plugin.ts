/* eslint-disable no-param-reassign */

import { Schema, Document } from 'mongoose';

interface ToJSONOptions {
  private?: boolean;
}

interface SchemaToJSONOptions {
  transform?: (doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) => unknown;
}

const deleteAtPath = (obj: Record<string, unknown>, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index] as string];
    return;
  }
  deleteAtPath(obj[path[index] as string] as Record<string, unknown>, path, index + 1);
};

const toJSON = <T extends Document>(schema: Schema<T>): void => {
  const toJSONOptions = schema.get('toJSON') as SchemaToJSONOptions | undefined;
  const transform = toJSONOptions?.transform;

  schema.set('toJSON', {
    ...toJSONOptions,
    transform(doc: Document, ret: Record<string, unknown>, options: Record<string, unknown>) {
      Object.keys(schema.paths).forEach((path) => {
        const schemaPath = schema.paths[path] as { options?: ToJSONOptions };
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
      return undefined;
    },
  });
};

export default toJSON;
