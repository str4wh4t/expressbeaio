import { makeSchema } from 'nexus';
import * as types from './resolvers';
import path from 'path';
import { authResolver, roleResolver } from './plugins/middlewareResolver';


const middleware = [authResolver, roleResolver];

export const schema = makeSchema({
  types: types,
  outputs: {
    schema: path.join(__dirname, '../', 'generated', 'schema.graphql'),
    typegen: path.join(__dirname, '../', 'generated', 'nexus.ts')
  },
  plugins: middleware
});
