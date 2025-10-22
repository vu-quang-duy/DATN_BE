import { TableColumnOptions, TableForeignKey, TableForeignKeyOptions } from 'typeorm';

type ColumnOption = Omit<TableColumnOptions, 'name' | 'type' | 'enum'>;
type ForeignKeyOption = Omit<TableForeignKeyOptions, 'columnNames' | 'referencedColumnNames' | 'referencedTableName'>;

export const MigrationConst = Object.freeze({
  idPrimaryColumn: {
    name: 'id',
    type: 'bigint',
    isPrimary: true,
    isGenerated: true, // Auto-increment
    generationStrategy: 'increment',
  } as TableColumnOptions,

  createdAtColumn: {
    name: 'created_at',
    type: 'timestamp',
    default: 'now()',
  } as TableColumnOptions,

  updatedAtColumn: {
    name: 'updated_at',
    type: 'timestamp',
    default: 'now()',
  } as TableColumnOptions,

  deletedAtColumn: {
    name: 'deleted_at',
    type: 'timestamp',
    isNullable: true,
  } as TableColumnOptions,

  foreignKey: (columnName, tableName, option?: ForeignKeyOption, referencedColumnName?: string) =>
    new TableForeignKey({
      columnNames: [columnName],
      referencedColumnNames: [referencedColumnName || 'id'],
      referencedTableName: tableName,
      ...option,
    }),

  booleanColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'boolean',
      ...option,
    }) as TableColumnOptions,

  floatColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'float',
      ...option,
    }) as TableColumnOptions,

  varcharColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'varchar',
      ...option,
    }) as TableColumnOptions,

  charColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'varchar',
      ...option,
    }) as TableColumnOptions,

  decimal: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'decimal',
      ...option,
    }) as TableColumnOptions,

  bigIntColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'bigint',
      ...option,
    }) as TableColumnOptions,

  smallIntColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'smallInt',
      ...option,
    }) as TableColumnOptions,

  enumColumn: (name, enumType, option?: ColumnOption) =>
    ({
      name,
      type: 'enum',
      enum: Object.values(enumType),
      ...option,
    }) as TableColumnOptions,

  dateColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'date',
      ...option,
    }) as TableColumnOptions,

  timestampColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'timestamp',
      ...option,
    }) as TableColumnOptions,

  jsonColumn: (name, option?: ColumnOption) =>
    ({
      name,
      type: 'json',
      ...option,
    }) as TableColumnOptions,
});
