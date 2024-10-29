import { intArg, mutationField, nonNull } from 'nexus';
import { Permission } from 'nexus-prisma';
import { PermissionCreateInputType, PermissionUpdateInputType } from './inputs';
import { permission } from 'process';

export const createPermission = mutationField('createPermission', {
  type: Permission.$name,
  args: {
    data: nonNull(PermissionCreateInputType),
  },
  description: 'Create permission',
  resolve: async (_, { data }, ctx) => {
    try {
      return await ctx.prisma.permission.create({
        data,
      });
    } catch (error) {
      throw new Error('Gagal menambahkan permission : ' + error);
    }
  },

});

export const updatePermission = mutationField('updatePermission', {
  type: Permission.$name,  // Mengembalikan objek Permission yang diperbarui
  description: 'Update permission',
  args: {
    permissionId: nonNull(intArg()),
    data: nonNull(PermissionUpdateInputType),
  },
  resolve: async (_, { permissionId, data }, { prisma }) => {
    // Mengupdate permission berdasarkan permissionId
    try {
      return await prisma.permission.update({
        where: {
          id: permissionId,  // Mencari permission berdasarkan id
        },
        data,
      });
    } catch (error) {
      throw new Error('Gagal memperbarui permission : ' + error);  // Mengembalikan error jika gagal
    }
  },
});

export const deletePermission = mutationField('deletePermission', {
  type: 'Boolean',  // Mengembalikan true jika berhasil dihapus
  description: 'Delete permission',
  args: {
    permissionId: nonNull(intArg()),
  },
  resolve: async (_, { permissionId }, { prisma }) => {
    try {
      await prisma.permission.delete({
        where: {
          id: permissionId,
        },
      });
      return true;  // Mengembalikan true jika berhasil
    } catch (error) {
      throw new Error('Gagal menghapus permission : ' + error);  // Mengembalikan error jika gagal
    }
  },
});