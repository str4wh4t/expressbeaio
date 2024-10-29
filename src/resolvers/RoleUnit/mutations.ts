import { intArg, mutationField, nonNull } from 'nexus';
import { RoleUnit } from 'nexus-prisma';
import { RoleUnitCreateInputType, RoleUnitUpdateInputType } from './inputs';

export const createRoleUnit = mutationField('createRoleUnit', {
  type: RoleUnit.$name,
  args: {
    data: nonNull(RoleUnitCreateInputType),
  },
  description: 'Create roleUnit',
  resolve: async (_, { data }, ctx) => {
    try {
      return await ctx.prisma.roleUnit.create({
        data,
      });
    } catch (error) {
      throw new Error('Gagal menambahkan roleUnit : ' + error);
    }
  },

});

export const updateRoleUnit = mutationField('updateRoleUnit', {
  type: RoleUnit.$name,  // Mengembalikan objek RoleUnit yang diperbarui
  description: 'Update roleUnit',
  args: {
    roleUnitId: nonNull(intArg()),
    data: nonNull(RoleUnitUpdateInputType),
  },
  resolve: async (_, { roleUnitId, data }, { prisma }) => {
    // Mengupdate roleUnit berdasarkan roleUnitId
    try {
      return await prisma.roleUnit.update({
        where: {
          id: roleUnitId,  // Mencari roleUnit berdasarkan id
        },
        data,
      });
    } catch (error) {
      throw new Error('Gagal memperbarui roleUnit : ' + error);  // Mengembalikan error jika gagal
    }
  },
});

export const deleteRoleUnit = mutationField('deleteRoleUnit', {
  type: 'Boolean',  // Mengembalikan true jika berhasil dihapus
  description: 'Delete roleUnit',
  args: {
    roleUnitId: nonNull(intArg()),
  },
  resolve: async (_, { roleUnitId }, { prisma }) => {
    try {
      await prisma.roleUnit.delete({
        where: {
          id: roleUnitId,
        },
      });
      return true;  // Mengembalikan true jika berhasil
    } catch (error) {
      throw new Error('Gagal menghapus roleUnit : ' + error);  // Mengembalikan error jika gagal
    }
  },
});