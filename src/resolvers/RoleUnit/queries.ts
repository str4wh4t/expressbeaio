import { queryField, nonNull, intArg } from 'nexus';
import { RoleUnit } from 'nexus-prisma';
import { RoleUnitWhereInput } from './inputs';

export const getRoleUnit = queryField('getRoleUnit', {
  type: RoleUnit.$name,
  description: 'Get a single role-unit assignment by ID',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    const roleUnit = await prisma.roleUnit.findUnique({
      where: { id },
    });
    if (!roleUnit) throw new Error('Role-unit assignment not found');
    return roleUnit;
  },
});

export const getRoleUnits = queryField('getRoleUnits', {
  type: 'RoleUnitList',
  description: 'Get a paginated list of role-unit assignments with optional filtering and sorting',
  args: {
    where: RoleUnitWhereInput,
  },
  resolve: async (_, { where }, { prisma }) => {
    const { user_id, unit_id, role_id, sortBy, descending, take = 10, skip = 0 } = where || {};

    const whereClause = {
      ...(user_id ? { user_id } : {}),
      ...(unit_id ? { unit_id } : {}),
      ...(role_id ? { role_id } : {}),
    };

    const orderBy = sortBy ? { [sortBy]: descending ? 'desc' : 'asc' } : undefined;

    const [data, total] = await Promise.all([
      prisma.roleUnit.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
      }),
      prisma.roleUnit.count({ where: whereClause }),
    ]);

    return { data, total };
  },
});
