import { makeSchema } from 'nexus';
import * as resolvers from './resolvers';
import * as scalars from './types/scalar';
import path from 'path';
import { authResolver, authRoleResolver, limiterResolver } from './plugins/middlewareResolver';


const middleware = [authResolver, authRoleResolver, limiterResolver];

export const schema = makeSchema({
  types: [resolvers, scalars],
  outputs: {
    schema: path.join(__dirname, '../', 'generated', 'schema.graphql'),
    typegen: path.join(__dirname, '../', 'generated', 'nexus.ts')
  },
  plugins: middleware
});
