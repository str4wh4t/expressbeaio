import { queryField, nonNull, intArg } from 'nexus';
import { User } from 'nexus-prisma';
import { UserWhereInput } from './inputs';

export const getUser = queryField('getUser', {
  type: User.$name,
  description: 'Get a single user by ID',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error('User not found');
    return user;
  },
});

export const getUsers = queryField('getUsers', {
  type: 'UserList',
  description: 'Get a paginated list of users with optional filtering and sorting',
  args: {
    where: UserWhereInput,
  },
  resolve: async (_, { where }, { prisma }) => {
    const { search, sortBy, descending, take = 10, skip = 0 } = where || {};

    const whereClause = search
      ? {
        OR: [
          { name: { contains: search } },
          { username: { contains: search } },
          { identity: { contains: search } },
          { email: { contains: search } },
        ],
      }
      : {};

    const orderBy = sortBy ? { [sortBy]: descending ? 'desc' : 'asc' } : undefined;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return { data, total };
  },
});