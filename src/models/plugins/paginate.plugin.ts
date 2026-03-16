import { Document, FilterQuery, Model, Schema } from 'mongoose';

export interface PaginateOptions {
  sortBy?: string;
  populate?: string;
  limit?: number | string;
  page?: number | string;
}

export interface QueryResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(filter: FilterQuery<T>, options: PaginateOptions): Promise<QueryResult<T>>;
}

interface PopulateOption {
  path: string;
  populate?: PopulateOption;
}

const buildPopulateObject = (populateOption: string): PopulateOption =>
  populateOption
    .split('.')
    .reverse()
    .reduce<PopulateOption>(
      (accumulator, path) =>
        accumulator.path
          ? {
              path,
              populate: accumulator,
            }
          : { path },
      { path: '' }
    );

const paginate = <T extends Document>(schema: Schema<T>): void => {
  schema.static('paginate', async function paginateDocuments(
    this: Model<T>,
    filter: FilterQuery<T>,
    options: PaginateOptions = {}
  ): Promise<QueryResult<T>> {
    let sort = 'createdAt';

    if (options.sortBy) {
      const sortingCriteria = options.sortBy.split(',').map((sortOption) => {
        const [key, order] = sortOption.split(':');
        return `${order === 'desc' ? '-' : ''}${key}`;
      });

      sort = sortingCriteria.join(' ');
    }

    const limit =
      options.limit && parseInt(options.limit.toString(), 10) > 0 ? parseInt(options.limit.toString(), 10) : 10;
    const page = options.page && parseInt(options.page.toString(), 10) > 0 ? parseInt(options.page.toString(), 10) : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsQuery = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        docsQuery = docsQuery.populate(buildPopulateObject(populateOption));
      });
    }

    const docsPromise = docsQuery.exec();
    const [totalResults, results] = await Promise.all([countPromise, docsPromise]);
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  });
};

export default paginate;
