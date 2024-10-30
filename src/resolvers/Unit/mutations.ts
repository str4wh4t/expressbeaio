import { mutationField, nonNull, intArg } from 'nexus';
import { Unit } from 'nexus-prisma';
import { UnitCreateInput, UnitUpdateInput } from './inputs';

export const createUnit = mutationField('createUnit', {
  type: Unit.$name,
  description: 'Create a new unit',
  args: {
    data: nonNull(UnitCreateInput),
  },
  resolve: async (_, { data }, { prisma }) => {
    try {
      return await prisma.unit.create({
        data,
      });
    } catch (error) {
      throw new Error('Failed to create unit: ' + error);
    }
  },
});

export const updateUnit = mutationField('updateUnit', {
  type: Unit.$name,
  description: 'Update an existing unit',
  args: {
    id: nonNull(intArg()),
    data: nonNull(UnitUpdateInput),
  },
  resolve: async (_, { id, data }, { prisma }) => {
    try {
      return await prisma.unit.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error('Failed to update unit: ' + error);
    }
  },
});

export const deleteUnit = mutationField('deleteUnit', {
  type: Unit.$name,
  description: 'Delete an existing unit',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    try {
      return await prisma.unit.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Failed to delete unit: ' + error);
    }
  },
});