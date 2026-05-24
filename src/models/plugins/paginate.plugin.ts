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

const paginate = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Schema<any> // TODO(ts-migration): base Schema type keeps plugin compatible with typed schemas
): void => {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let docsPromise: any = this.find(filter).sort(sort).skip(skip).limit(limit); // TODO(ts-migration): legacy Mongoose query chaining has unstable generic types

    if (options.populate) {
      type NestedPopulate = string | { path: string; populate: NestedPopulate };
      options.populate.split(',').forEach((populateOption: string) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            // TODO(ts-migration): nested populate shape is recursive and hard to encode precisely for legacy mongoose
            .reduce<NestedPopulate>((a, b) => ({ path: b, populate: a }), '')
        );
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
