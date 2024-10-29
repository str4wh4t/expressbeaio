import {
  booleanArg,
  intArg,
  list,
  nonNull,
  nullable,
  objectType,
  queryField,
  stringArg,
} from 'nexus';

export const getListUnit = queryField('getListUnit', {
  type: 'ListUnitType',
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

    const data = await prisma.unit.findMany({
      where,
      orderBy: orderByArg,
      take: take ? take : 10,
      skip: skip ? skip : 0,
    });

    const total = await prisma.unit.count({
      where,
    });

    return {
      data,
      total,
    };
  },
});
