import { mutationField, nonNull, intArg } from 'nexus';
import { RoleUnit } from 'nexus-prisma';
import { RoleUnitCreateInput, RoleUnitUpdateInput } from './inputs';

export const roleUnitCreate = mutationField('roleUnitCreate', {
  type: RoleUnit.$name,
  description: 'Create a new role-unit assignment',
  args: {
    data: nonNull(RoleUnitCreateInput),
  },
  resolve: async (_, { data }, { prisma }) => {
    try {
      return await prisma.roleUnit.create({
        data,
      });
    } catch (error) {
      throw new Error('Failed to create role-unit assignment: ' + error);
    }
  },
});

export const roleUnitUpdate = mutationField('roleUnitUpdate', {
  type: RoleUnit.$name,
  description: 'Update an existing role-unit assignment',
  args: {
    id: nonNull(intArg()),
    data: nonNull(RoleUnitUpdateInput),
  },
  resolve: async (_, { id, data }, { prisma }) => {
    try {
      return await prisma.roleUnit.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error('Failed to update role-unit assignment: ' + error);
    }
  },
});

export const roleUnitDelete = mutationField('roleUnitDelete', {
  type: RoleUnit.$name,
  description: 'Delete an existing role-unit assignment',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    try {
      return await prisma.roleUnit.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Failed to delete role-unit assignment: ' + error);
    }
  },
});