import {
  booleanArg,
  intArg,
  list,
  nonNull,
  nullable,
  queryField,
  stringArg,
} from 'nexus';

export const getListRole = queryField('getListRole', {
  type: 'ListRoleType',
  description: 'Get list of role',
  args: {
    take: nullable(intArg()),
    skip: nullable(intArg()),
    search: nullable(stringArg()),
    sortBy: nullable(stringArg()),
    descending: nullable(booleanArg()),
  },
  resolve: async (
    _,
    { take, skip, search, sortBy, descending },
    { prisma },
  ) => {

    const where = search ? { name: { contains: search } } : {};

    const orderByArg = sortBy
      ? {
        [sortBy]: descending ? 'desc' : 'asc',
      }
      : {};

    const data = await prisma.role.findMany({
      where,
      orderBy: orderByArg,
      take: take ? take : 10,
      skip: skip ? skip : 0,
    });

    const total = await prisma.role.count({
      where,
    });

    return {
      data,
      total,
    };
  },
});
