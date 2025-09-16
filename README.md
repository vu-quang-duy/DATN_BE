# The API Service for Sign School

- Prerequisite

> NodeJS 20.x (20.11.1)

- Step 1:

  > Install the node modules
  > `npm install`

- Step 5:

  > Run the app
  > `npm run start:dev`

## Development

- Migration

```bash
# create new script migration
# -> npm run migration:create --name=MIGRATION_NAME
npm run migration:create --name=create-user-table

# run migration
# -> npm run migration
npm run migration

# create default value
# npm run ts src/seeding/default-seeding.ts
npm run ts src/seeding/default-seeding.ts

# revert migration
# -> npm run migration:revert
npm run migration:revert
```

- Make module

```bash
$ npm i -g @nestjs/cli

$ nest g module api/user && nest g service api/user && nest g controller api/user
```

