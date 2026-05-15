/* eslint-disable no-param-reassign */

import { Schema, Document, Model } from 'mongoose';

export interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number | string;
  page?: number | string;
}

export interface QueryResult {
  results: Document[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(filter: Record<string, unknown>, options: PaginateOptions): Promise<QueryResult>;
}

// TODO(ts-migration): Schema type parameter kept as base Schema for plugin compatibility with typed schemas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paginate = (schema: Schema<any>): void => {
  // TODO(ts-migration): Mongoose statics type does not include custom methods
  // eslint-disable-next-line dot-notation
  schema.statics['paginate'] = async function (
    filter: Record<string, unknown>,
    options: PaginateOptions
  ): Promise<QueryResult> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption: string) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = 'createdAt';
    }

    const limit = options.limit && parseInt(String(options.limit), 10) > 0 ? parseInt(String(options.limit), 10) : 10;
    const page = options.page && parseInt(String(options.page), 10) > 0 ? parseInt(String(options.page), 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    // TODO(ts-migration): Mongoose query chaining returns complex generic types; typed loosely here
    let docsPromise: any = this.find(filter).sort(sort).skip(skip).limit(limit); // eslint-disable-line @typescript-eslint/no-explicit-any

    if (options.populate) {
      options.populate.split(',').forEach((populateOption: string) => {
        const populatePath = populateOption.split('.').reverse();
        const nestedPopulate = populatePath
          .slice(1)
          .reduce<Record<string, unknown> | string>((populate, path) => ({ path, populate }), populatePath[0] as string);
        docsPromise = docsPromise.populate(nestedPopulate);
      });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values as [number, Document[]];
      const totalPages = Math.ceil(totalResults / limit);
      const result: QueryResult = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

export default paginate;

module.exports = paginate;
module.exports.default = paginate;
