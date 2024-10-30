import { queryField, nonNull, intArg } from 'nexus';
import { Role } from 'nexus-prisma';
import { RoleWhereInput } from './inputs';

export const getRole = queryField('getRole', {
  type: Role.$name,
  description: 'Get a single role by ID',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    const role = await prisma.role.findUnique({
      where: { id },
    });
    if (!role) throw new Error('Role not found');
    return role;
  },
});

export const getRoles = queryField('getRoles', {
  type: 'RoleList',
  description: 'Get a paginated list of roles with optional filtering and sorting',
  args: {
    where: RoleWhereInput,
  },
  resolve: async (_, { where }, { prisma }) => {
    const { search, sortBy, descending, take = 10, skip = 0 } = where || {};

    const whereClause = search
      ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }
      : {};

    const orderBy = sortBy ? { [sortBy]: descending ? 'desc' : 'asc' } : undefined;

    const [data, total] = await Promise.all([
      prisma.role.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
      }),
      prisma.role.count({ where: whereClause }),
    ]);

    return { data, total };
  },
});
