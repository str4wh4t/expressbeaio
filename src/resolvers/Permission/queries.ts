import { queryField, nonNull, intArg } from 'nexus';
import { Permission } from 'nexus-prisma';
import { PermissionWhereInput } from './inputs';

export const getPermission = queryField('getPermission', {
  type: Permission.$name,
  description: 'Get a single permission by ID',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) throw new Error('Permission not found');
    return permission;
  },
});

export const getPermissions = queryField('getPermissions', {
  type: 'PermissionList',
  description: 'Get a paginated list of permissions with optional filtering and sorting',
  args: {
    where: PermissionWhereInput,
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
      prisma.permission.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
      }),
      prisma.permission.count({ where: whereClause }),
    ]);

    return { data, total };
  },
});
