/* eslint-disable no-param-reassign */

import { Schema, Document, FilterQuery, Model } from 'mongoose';

type PopulatePath = string | { path: string; populate: PopulatePath };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongoosePopulateQuery = any; // TODO(ts-migration): Mongoose query chaining returns complex generic types; typed loosely here

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
  paginate(filter: FilterQuery<T>, options: PaginateOptions): Promise<QueryResult>;
}

const paginate = <T extends Document>(schema: Schema<T>): void => {
  // TODO(ts-migration): Mongoose statics type does not include custom methods
  // eslint-disable-next-line dot-notation
  schema.statics['paginate'] = async function (filter: FilterQuery<T>, options: PaginateOptions): Promise<QueryResult> {
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

    const queryFilter = filter as FilterQuery<T>;
    const countPromise = this.countDocuments(queryFilter).exec();
    let docsPromise: MongoosePopulateQuery = this.find(queryFilter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption: string) => {
        const [firstPopulatePath, ...remainingPopulatePaths] = populateOption.split('.').reverse() as [string, ...string[]];
        const populatePath = remainingPopulatePaths.reduce<PopulatePath>(
          (acc, path) => ({ path, populate: acc }),
          firstPopulatePath
        );
        docsPromise = docsPromise.populate(populatePath);
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
