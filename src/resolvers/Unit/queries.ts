import { queryField, nonNull, intArg } from 'nexus';
import { Unit } from 'nexus-prisma';
import { UnitWhereInput } from './inputs';

export const getUnit = queryField('getUnit', {
  type: Unit.$name,
  description: 'Get a single unit by ID',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    const unit = await prisma.unit.findUnique({
      where: { id },
    });
    if (!unit) throw new Error('Unit not found');
    return unit;
  },
});

export const getUnits = queryField('getUnits', {
  type: 'UnitList',
  description: 'Get a paginated list of units with optional filtering and sorting',
  args: {
    where: UnitWhereInput,
  },
  resolve: async (_, { where }, { prisma }) => {
    const { search, sortBy, descending, take = 10, skip = 0 } = where || {};

    const whereClause = search
      ? {
        OR: [
          { codename: { contains: search } },
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }
      : {};

    const orderBy = sortBy ? { [sortBy]: descending ? 'desc' : 'asc' } : undefined;

    const [data, total] = await Promise.all([
      prisma.unit.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
      }),
      prisma.unit.count({ where: whereClause }),
    ]);

    return { data, total };
  },
});
