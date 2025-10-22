import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ENV } from './environment';

const config: DataSourceOptions = {
  type: ENV.DATABASE.DB_TYPE as any,
  host: ENV.DATABASE.DB_HOST,
  port: ENV.DATABASE.DB_PORT,
  username: ENV.DATABASE.DB_USERNAME,
  password: ENV.DATABASE.DB_PASSWORD,
  database: ENV.DATABASE.DB_NAME,
  entities: [join(__dirname, '/../entities/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/../migrations/*{.ts,.js}')],
  synchronize: false,
};

const configB: DataSourceOptions = {
  type: ENV.DATABASE.DB_B_TYPE as any,
  host: ENV.DATABASE.DB_B_HOST,
  port: ENV.DATABASE.DB_B_PORT,
  username: ENV.DATABASE.DB_B_USERNAME,
  password: ENV.DATABASE.DB_B_PASSWORD,
  database: ENV.DATABASE.DB_B_NAME,
  entities: [join(__dirname, '/../entitiesB/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/../migrations/*{.ts,.js}')],
  synchronize: false,
};

export const dataSource = new DataSource(config as DataSourceOptions);
export const dataSourceB = new DataSource(configB as DataSourceOptions);

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return config;
  }
}

@Injectable()
export class TypeOrmConfigServiceB implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return configB;
  }
}

export const dataSourceFactory = async (options: DataSourceOptions) => {
  const ds = new DataSource(options);
  return ds.initialize();
};

export const connectSource = async () => {
  if (dataSource.isInitialized) {
    return;
  }
  await dataSource.initialize();
  console.log(`======== Connect ${dataSource.options.database} data source successful ========`);
};

export const connectSourceB = async () => {
  if (!dataSourceB.isInitialized) {
    await dataSourceB.initialize();
    console.log(`======== Connect ${dataSourceB.options.database} data source successful ========`);
  }
};
