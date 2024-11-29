import { mutationField, nonNull, intArg } from 'nexus';
import { Permission } from 'nexus-prisma';
import { PermissionCreateInput, PermissionUpdateInput } from './inputs';

export const permissionCreate = mutationField('permissionCreate', {
  type: Permission.$name,
  description: 'Create a new permission',
  args: {
    data: nonNull(PermissionCreateInput),
  },
  resolve: async (_, { data }, { prisma }) => {
    try {
      return await prisma.permission.create({
        data,
      });
    } catch (error) {
      throw new Error('Failed to create permission: ' + error);
    }
  },
});

export const permissionUpdate = mutationField('permissionUpdate', {
  type: Permission.$name,
  description: 'Update an existing permission',
  args: {
    id: nonNull(intArg()),
    data: nonNull(PermissionUpdateInput),
  },
  resolve: async (_, { id, data }, { prisma }) => {
    try {
      return await prisma.permission.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error('Failed to update permission: ' + error);
    }
  },
});

export const permissionDelete = mutationField('permissionDelete', {
  type: Permission.$name,
  description: 'Delete an existing permission',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    try {
      return await prisma.permission.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Failed to delete permission: ' + error);
    }
  },
});