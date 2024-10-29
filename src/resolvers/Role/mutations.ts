import { intArg, mutationField, nonNull, list } from 'nexus';
import { Role } from 'nexus-prisma';
import { RoleCreateInputType, RoleUpdateInputType } from './inputs';

export const createRole = mutationField('createRole', {
    type: Role.$name,
    description: 'Create role',
    args: {
        data: nonNull(RoleCreateInputType),
    },
    resolve: async (_, { data }, ctx) => {
        try {
            return await ctx.prisma.role.create({
                data,
            });
        } catch (error) {
            throw new Error('Gagal menambahkan role : ' + error);
        }
    },
});

export const updateRole = mutationField('updateRole', {
    type: Role.$name,
    description: 'Update role',
    args: {
        roleId: nonNull(intArg()),
        data: nonNull(RoleUpdateInputType),
    },
    resolve: async (_, { roleId, data }, { prisma }) => {
        // Mengupdate role berdasarkan roleId
        try {
            return await prisma.role.update({
                where: {
                    id: roleId,
                },
                data,
            });
        } catch (error) {
            throw new Error('Gagal memperbarui role : ' + error);
        }
    },
});

export const deleteRole = mutationField('deleteRole', {
    type: 'Boolean',
    description: 'Delete role',
    args: {
        roleId: nonNull(intArg()),
    },
    resolve: async (_, { roleId }, { prisma }) => {
        try {
            await prisma.role.delete({
                where: {
                    id: roleId,
                },
            });
            return true;
        } catch (error) {
            throw new Error('Gagal menghapus role : ' + error);
        }
    },
});

export const assignPermission = mutationField('assignPermission', {
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