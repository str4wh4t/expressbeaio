import { mutationField, nonNull, intArg, list } from 'nexus';
import { Role } from 'nexus-prisma';
import { RoleCreateInput, RoleUpdateInput } from './inputs';

export const createRole = mutationField('createRole', {
    type: Role.$name,
    description: 'Create a new role',
    args: {
        data: nonNull(RoleCreateInput),
    },
    resolve: async (_, { data }, { prisma }) => {
        try {
            return await prisma.role.create({
                data,
            });
        } catch (error) {
            throw new Error('Failed to create role: ' + error);
        }
    },
});

export const updateRole = mutationField('updateRole', {
    type: Role.$name,
    description: 'Update an existing role',
    args: {
        id: nonNull(intArg()),
        data: nonNull(RoleUpdateInput),
    },
    resolve: async (_, { id, data }, { prisma }) => {
        try {
            return await prisma.role.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error('Failed to update role: ' + error);
        }
    },
});

export const deleteRole = mutationField('deleteRole', {
    type: Role.$name,
    description: 'Delete an existing role',
    args: {
        id: nonNull(intArg()),
    },
    resolve: async (_, { id }, { prisma }) => {
        try {
            return await prisma.role.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error('Failed to delete role: ' + error);
        }
    },
});

export const assignPermissions = mutationField('assignPermissions', {
    type: Role.$name,
    description: 'Assign role to permission',
    args: {
        roleId: nonNull(intArg()),
        permissionIds: list(intArg()),
    },
    resolve: async (_, { roleId, permissionIds }, { prisma }) => {
        return await prisma.role.update({
            where: {
                id: roleId,
            },
            data: {
                permissions: {
                    set: permissionIds.map((permissionId: number) => ({ id: permissionId })),
                },
            }
        });
    },
});