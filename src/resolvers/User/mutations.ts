import { intArg, stringArg, mutationField, nonNull, list } from 'nexus';
import { generateToken, JwtPayload } from '../../utils/jwt';
import { User } from 'nexus-prisma';
import { UserChangePasswordInput, UserCreateInput, UserUpdateInput } from './inputs';
import { compare } from 'bcryptjs';
import { Context } from '../../context';
import { PASSWORD_LOGIN_DEFAULT } from '../../utils/constants';
import { PrismaClient } from '@prisma/client';
import { getEdukData } from '../../datasources/eduk';


export const createUser = mutationField('createUser', {
  type: User.$name,
  description: 'Create a new user',
  args: {
    data: nonNull(UserCreateInput),
  },
  resolve: async (_, { data }, { prisma }) => {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (error) {
      throw new Error('Failed to create user: ' + error);
    }
  },
});

export const updateUser = mutationField('updateUser', {
  type: User.$name,
  description: 'Update an existing user',
  args: {
    id: nonNull(intArg()),
    data: nonNull(UserUpdateInput),
  },
  resolve: async (_, { id, data }, { prisma }) => {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error('Failed to update user: ' + error);
    }
  },
});

export const deleteUser = mutationField('deleteUser', {
  type: User.$name,
  description: 'Delete an existing user',
  args: {
    id: nonNull(intArg()),
  },
  resolve: async (_, { id }, { prisma }) => {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error('Failed to delete user: ' + error);
    }
  },
});

export const resetPassword = mutationField('resetPassword', {
  type: User.$name,
  description: 'Reset user password',
  args: {
    userId: nonNull(intArg())
  },
  resolve: async (_, { userId }, { prisma }) => {
    // throw new Error('Role not found');
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: PASSWORD_LOGIN_DEFAULT,
      }
    });
  },
});

export const login = mutationField('login', {
  type: 'String',
  description: 'Login user with username and password',
  args: {
    username: nonNull(stringArg()),
    password: nonNull(stringArg()),
  },
  resolve: async (_, { username, password }, ctx: Context) => {
    try {
      const user = await ctx.prisma.user.findUnique({ where: { username } });
      if (!password) {
        throw new Error('Invalid username or password');
      }

      if (!user || !(await compare(password, user.password))) {
        throw new Error('Invalid username or password');
      }

      const roles = await ctx.prisma.role.findMany({ where: { users: { some: { id: user?.id } } }, select: { name: true } });
      const permissions = await ctx.prisma.permission.findMany({ where: { roles: { some: { users: { some: { id: user?.id } } } } }, select: { name: true } });
      const payload: JwtPayload = {
        userId: user.id,
        roles: roles.map(role => role.name) || [],
        selectedRole: null,
        selectedUnit: null,
        permissions: permissions.map(permission => permission.name) || [],
      }

      return generateToken(payload);
    } catch (error) {
      throw new Error('Failed to login: ' + error);
    }
  },
});

export const changePassword = mutationField('changePassword', {
  type: User.$name,
  description: 'Change user password',
  args: {
    id: nonNull(intArg({
      description: 'ID of the user'
    })),
    data: nonNull(UserChangePasswordInput),
  },
  resolve: async (_, { id, data }, { prisma }) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new Error('User not found');

      const validPassword = await compare(data.currentPassword, user.password);
      if (!validPassword) throw new Error('Current password is incorrect');

      return await prisma.user.update({
        where: { id },
        data: { password: data.newPassword },
      });
    } catch (error) {
      throw new Error('Failed to change password: ' + error);
    }
  },
});

const userAssignRoleByNamesFunc = async (userId: number, roleNames: string[], prisma: PrismaClient) => {
  let roleIds: number[];
  const foundRoles = await prisma.role.findMany({
    where: {
      name: {
        in: roleNames,
      },
    },
    select: {
      id: true,
    },
  });

  // Pastikan semua role ditemukan, jika ada yang tidak ditemukan, kita lempar error
  if (foundRoles.length !== roleNames.length) {
    throw new Error('One or more roles not found.');
  }

  // Ekstrak role IDs dari hasil query
  roleIds = foundRoles.map((role) => role.id);

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      roles: {
        set: roleIds.map((roleId: number) => ({ id: roleId })),
      },
    }
  });
};

const userAssignRoleByIdsFunc = async (userId: number, roleIds: number[], prisma: PrismaClient) => {
  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      roles: {
        set: roleIds.map((roleId: number) => ({ id: roleId })),
      },
    }
  });
};

export const assignRoleByIds = mutationField('assignRoleByIds', {
  type: User.$name,
  description: 'Assign role to user',
  args: {
    userId: nonNull(intArg()),
    roleIds: list(intArg()),
  },
  resolve: async (_, { userId, roleIds }, { prisma }) => {
    await prisma.roleUnit.deleteMany({
      where: {
        user_id: userId,
        role_id: {
          notIn: roleIds, // Hapus semua role_id yang tidak ada dalam roleIds baru
        },
      },
    });
    return await userAssignRoleByIdsFunc(userId, roleIds, prisma);
  },
});

export const assignRoleToUnits = mutationField('assignRoleToUnits', {
  type: User.$name,
  description: 'Assign role to user unit by unit ids',
  args: {
    userId: nonNull(intArg()),
    roleId: nonNull(intArg()),
    unitIds: list(intArg()),
  },
  resolve: async (_, { userId, roleId, unitIds }, { prisma }) => {
    try {
      // Loop over unitIds and create or update entries in UserUnit

      // check if user already has the role
      await prisma.user.findFirstOrThrow({
        where: {
          id: userId,
          roles: {
            some: {
              id: roleId,
            },
          },
        },
      });

      // Jika `unitIds` kosong atau tidak diberikan, hapus semua unit yang terkait dengan user dan role ini
      if (!unitIds || unitIds.length === 0) {
        await prisma.roleUnit.deleteMany({
          where: {
            user_id: userId,
            role_id: roleId,
          },
        });

        // Mengembalikan user setelah semua unit dilepas
        return prisma.user.findUnique({
          where: { id: userId },
        });
      }

      // Hapus unit yang tidak ada di dalam `unitIds` baru
      await prisma.roleUnit.deleteMany({
        where: {
          user_id: userId,
          role_id: roleId,
          unit_id: {
            notIn: unitIds, // Hapus semua unit_id yang tidak ada di dalam unitIds baru
          },
        },
      });

      const operations = unitIds.map(async (unitId: number) => {
        // Menggunakan `upsert` untuk membuat atau memperbarui entri
        return await prisma.roleUnit.upsert({
          where: {
            // Unik berdasarkan kombinasi userId, roleId, dan unitId
            user_id_role_id_unit_id: {
              user_id: userId,
              role_id: roleId,
              unit_id: unitId,
            },
          },
          update: {
            // Tidak ada update yang diperlukan dalam kasus ini, namun jika ada field lain yang perlu di-update, bisa ditambahkan di sini
          },
          create: {
            user_id: userId,
            role_id: roleId,
            unit_id: unitId,
          },
        });
      });

      // Tunggu semua operasi selesai
      await Promise.all(operations);

      // Mengembalikan user yang sudah diperbarui
      return prisma.user.findUnique({
        where: { id: userId },
      });
    }
    catch (error) {
      throw new Error('Failed to user unit by unit ids : ' + error);
    }
  },
});

export const selectRole = mutationField('selectRole', {
  type: 'String',
  description: 'Select role to user',
  args: {
    roleName: nonNull(stringArg()),
  },
  resolve: async (_, { roleName }, ctx: Context) => {
    try {
      const userId = ctx.userId || 0;
      const roles = await ctx.prisma.role.findMany({ where: { users: { some: { id: userId } } }, select: { name: true } });
      const selectedRole = await ctx.prisma.role.findFirstOrThrow({ where: { name: roleName, users: { some: { id: userId } } } });
      const permissions = await ctx.prisma.permission.findMany({ where: { roles: { some: { name: roleName } } }, select: { name: true } });
      const payload: JwtPayload = {
        userId: ctx.userId || 0,
        roles: roles.map(role => role.name) || [],
        selectedRole: selectedRole,
        permissions: permissions.map(permission => permission.name) || [],
        selectedUnit: null,
      }

      return generateToken(payload);
    } catch (error) {
      throw new Error('Failed to select role: ' + error);
    }
  },
});

export const selectUnit = mutationField('selectUnit', {
  type: 'String',
  description: 'Select unit to user role',
  args: {
    unitId: nonNull(intArg()),
  },
  resolve: async (_, { unitId }, ctx: Context) => {
    try {
      const userId = ctx.userId || 0;
      const roleId = ctx.selectedRole?.id || 0;

      const roleUnit = await ctx.prisma.roleUnit.findFirstOrThrow({ where: { user_id: userId, role_id: roleId, unit_id: unitId }, select: { 'unit': true } });

      const payload: JwtPayload = {
        userId: ctx.userId || 0,
        roles: ctx.roles || [],
        selectedRole: ctx.selectedRole || null,
        permissions: ctx.permissions || [],
        selectedUnit: roleUnit.unit,
      }

      return generateToken(payload);
    } catch (error) {
      throw new Error('Failed to select role: ' + error);
    }
  },
});

export const loginsso = mutationField('loginsso', {
  type: 'String',
  args: {
    token: nonNull(stringArg()),
  },
  resolve: async (_, { token }, ctx) => {
    //get data from sso
    const data = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    // console.log(data);

    if (data.error) {
      throw new Error(data.error.message)
    }
    const sso_identity = data.surname;
    const sso_email = data.mail;
    if (sso_identity.length == 14) {
      throw new Error('Akses mahasiswa belum diizinkan')
    }
    // console.log(data)

    //cek apakah user sudah ada di database
    let user = await ctx.prisma.user.findUnique({
      where: {
        identity: sso_identity,
      },
    });

    const dataEduk = await getEdukData(sso_identity);
    const errorEduk = 'Silahkan cek email SSO yang Anda gunakan atau status pegawai Anda di Eduk terlebih dahulu. Email SSO yg Anda gunakan: ' + sso_email + ' dengan NIP: ' + sso_identity;
    // console.log(dataEduk);
    if (!dataEduk) {
      throw new Error('Data pegawai Anda tidak ditemukan di Eduk. ' + errorEduk);
    }

    if (![1, 6, 13, 15, 20, 22].includes(dataEduk.status)) {
      throw new Error('Status pegawai Anda tidak aktif. ' + errorEduk);
    }

    // const edukFoto = dataEduk.foto ? `https://e-duk.apps.undip.ac.id/images/foto/${dataEduk.foto}` : null;
    const edukFoto = dataEduk.foto ? dataEduk.foto : null;

    if (!user) {
      //create new user
      const createUser = await ctx.prisma.user.create({
        data: {
          name: data.displayName,
          email: data.mail,
          identity: sso_identity,
          profile_photo_path: edukFoto,

          unit1_id: dataEduk.unit_id || null,
          unit2_id: dataEduk.unit2_id || null,
          unit3_id: dataEduk.unit3_id || null,
          unit1_name: dataEduk.unit_name || null,
          unit2_name: dataEduk.unit2_name || null,
          unit3_name: dataEduk.unit3_name || null,

          gelar_depan: dataEduk.gelar_depan || null,
          gelar_belakang: dataEduk.gelar_belakang || null,
        },
      });

      if (!createUser) {
        throw new Error('Gagal membuat user baru')
      }

      // await ctx.prisma.userHasRoles.create({
      //   data: {
      //     model_id: user.id,
      //     role_id: 2,
      //     // unit_id: dataEduk.unit_id || null,
      //     // unit2_id: dataEduk.unit2_id || null,
      //     // unit3_id: dataEduk.unit3_id || null,
      //   },
      // });

      await userAssignRoleByIdsFunc(createUser.id, [2], ctx.prisma);

      user = await ctx.prisma.user.findUnique({
        where: {
          id: createUser.id,
        },
      });

    }

    //update foto profil
    if (user.profile_photo_path != edukFoto) {
      await ctx.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          profile_photo_path: edukFoto,
        },
      });
    }

    //update unit
    // if (user.unit_id != dataEduk.unit_id || user.unit2_id != dataEduk.unit2_id || user.unit3_id != dataEduk.unit3_id || user.unit_name != dataEduk.unit_name || user.unit2_name != dataEduk.unit2_name || user.unit3_name != dataEduk.unit3_name) {
    //   await ctx.prisma.user.update({
    //     where: {
    //       id: user.id,
    //     },
    //     data: {
    //       unit_id: dataEduk.unit_id || null,
    //       unit2_id: dataEduk.unit2_id || null,
    //       unit3_id: dataEduk.unit3_id || null,
    //       unit_name: dataEduk.unit_name || null,
    //       unit2_name: dataEduk.unit2_name || null,
    //       unit3_name: dataEduk.unit3_name || null,
    //     },
    //   });
    // }

    //update nama dan gelar di eduk
    // if (user.name != dataEduk.nama || user.gelar_depan != dataEduk.gelar_depan || user.gelar_belakang != dataEduk.gelar_belakang) {
    //   await ctx.prisma.user.update({
    //     where: {
    //       id: user.id,
    //     },
    //     data: {
    //       name: dataEduk.nama,
    //       gelar_depan: dataEduk.gelar_depan || null,
    //       gelar_belakang: dataEduk.gelar_belakang || null,
    //     },
    //   });
    // }

    // if (device_checksum) {
    //   //cek device_checksum di user lain
    //   const deviceAnotherUser = await ctx.prisma.user.findFirst({
    //     where: {
    //       AND: [
    //         {
    //           device_checksum: device_checksum,
    //         },
    //         {
    //           id: {
    //             not: user.id,
    //           },
    //         },
    //       ],
    //     },
    //   });
    //   if (deviceAnotherUser) {
    //     throw new Error('Device ini sudah digunakan oleh user lain')
    //   }

    //   //cek device_checksum
    //   if (user.device_checksum == null) {
    //     //setelah reset jadi null
    //     if (device_checksum != null) {
    //       await ctx.prisma.user.update({
    //         where: {
    //           id: user.id,
    //         },
    //         data: {
    //           device_checksum: device_checksum,
    //         },
    //       });
    //     }

    //   } else if (user.device_checksum != device_checksum) {
    //     throw new Error('Device yang digunakan tidak sama, silahkan hubungi Admin untuk reset device')
    //   }
    // }

    const roles = await ctx.prisma.role.findMany({ where: { users: { some: { id: user?.id } } }, select: { name: true } });
    const permissions = await ctx.prisma.permission.findMany({ where: { roles: { some: { users: { some: { id: user?.id } } } } }, select: { name: true } });
    const payload: JwtPayload = {
      userId: user.id,
      roles: roles.map((role: { name: any; }) => role.name) || [],
      selectedRole: null,
      permissions: permissions.map((permission: { name: any; }) => permission.name) || [],
      selectedUnit: null,
    }

    return generateToken(payload);

  }
});