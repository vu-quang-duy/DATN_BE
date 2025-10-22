import {
  Between,
  EntityMetadata,
  FindOptionsSelectByString,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Sort,
} from 'typeorm';
import { ObjUtil } from './object';

export class QueryUtil {
  static betweenNumber = (from, to) => {
    if (!isNaN(from) && !isNaN(to)) {
      return Between(from, to); // include equals
    } else if (from || to) {
      return from ? MoreThanOrEqual(from) : LessThanOrEqual(to);
    }
  };

  static betweenDate = (from: Date, to: Date) => {
    if (from && to) {
      return Between(from, to); // include equals
    } else if (from || to) {
      return from ? MoreThanOrEqual(from) : LessThanOrEqual(to);
    }
  };

  static formatSort = (orderBy: string, sortBy: Sort) => {
    return orderBy && orderBy !== 'all' ? { [orderBy]: sortBy } : {};
  };

  static getCols<T>(entityMetaData: EntityMetadata): any {
    let result: Record<keyof T, boolean> = {} as any;
    for (const key of Object.keys(entityMetaData.propertiesMap)) {
      result = { ...result, [key]: true };
    }
    return result;
  }

  static getInQuery = (val: any) => {
    if (typeof val === 'string' || typeof val === 'number') {
      return In([val]);
    }
    return In(val);
  };

  static getSort = (orderBy: string, sortBy: string) => {
    if (!orderBy || !sortBy || orderBy === 'all') return {};
    return ObjUtil.createObjectFromPath(orderBy, sortBy);
  };

  static bSelect<T>(alias: string, fields: FindOptionsSelectByString<T>) {
    return fields.map((item) => `${alias}.${item as any}`);
  }
}
