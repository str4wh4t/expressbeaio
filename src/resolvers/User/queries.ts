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
import { User } from 'nexus-prisma';

export const getListUser = queryField('getListUser', {
  type: 'ListUserType',
  description: 'Get list of user',
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

    const data = await prisma.user.findMany({
      where,
      orderBy: orderByArg,
      take: take ? take : 10,
      skip: skip ? skip : 0,
    });

    const total = await prisma.user.count({
      where,
    });

    return {
      data,
      total,
    };
  },
});


export const getUser = queryField('getUser', {
  type: User.$name,
  description: 'Get user by id',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    return await prisma.user.findUnique({
      where: {
        id,
      }
    });
  },
});