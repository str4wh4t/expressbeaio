import { intArg, mutationField, nonNull } from 'nexus';
import { Unit } from 'nexus-prisma';
import { UnitCreateInputType, UnitUpdateInputType } from './inputs';

export const createUnit = mutationField('createUnit', {
  type: Unit.$name,
  args: {
    data: nonNull(UnitCreateInputType),
  },
  description: 'Create unit',
  resolve: async (_, { data }, ctx) => {
    try {
      return await ctx.prisma.unit.create({
        data,
      });
    } catch (error) {
      throw new Error('Gagal menambahkan unit : ' + error);
    }
  },

});

export const updateUnit = mutationField('updateUnit', {
  type: Unit.$name,  // Mengembalikan objek Unit yang diperbarui
  description: 'Update unit',
  args: {
    unitId: nonNull(intArg()),
    data: nonNull(UnitUpdateInputType),
  },
  resolve: async (_, { unitId, data }, { prisma }) => {
    // Mengupdate unit berdasarkan id
    try {
      return await prisma.unit.update({
        where: {
          id: unitId,  // Mencari unit berdasarkan id
        },
        data,
      });
    } catch (error) {
      throw new Error('Gagal memperbarui unit : ' + error);  // Mengembalikan error jika gagal
    }
  },
});

export const deleteUnit = mutationField('deleteUnit', {
  type: 'Boolean',  // Mengembalikan true jika berhasil dihapus
  description: 'Delete unit',
  args: {
    unitId: nonNull(intArg()),
  },
  resolve: async (_, { unitId }, { prisma }) => {
    try {
      await prisma.unit.delete({
        where: {
          id: unitId,
        },
      });
      return true;  // Mengembalikan true jika berhasil
    } catch (error) {
      throw new Error('Gagal menghapus unit : ' + error);  // Mengembalikan error jika gagal
    }
  },
});