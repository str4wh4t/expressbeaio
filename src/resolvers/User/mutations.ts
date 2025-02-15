import { intArg, stringArg, mutationField, nonNull, list } from 'nexus';
import { generateToken, JwtPayload } from '../../utils/jwt';
import { User } from 'nexus-prisma';
import { UserChangePasswordInput, UserCreateInput, UserUpdateInput } from './inputs';
import { compare } from 'bcryptjs';
import { Context } from '../../context';
import { PASSWORD_LOGIN_DEFAULT } from '../../utils/constants';
import { PrismaClient } from '@prisma/client';
import { getEdukData } from '../../datasources/eduk';
import { StatusResponseObject } from './objects';
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export const userCreate = mutationField('userCreate', {
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

export const userUpdate = mutationField('userUpdate', {
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

export const userDelete = mutationField('userDelete', {
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

export const userResetPassword = mutationField('userResetPassword', {
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

      return generateToken(payload, process.env.TOKEN_HOURS || '1h');
    } catch (error) {
      throw new Error('Failed to login: ' + error);
    }
  },
});

export const userChangePassword = mutationField('userChangePassword', {
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

export const userAssignRoleByIds = mutationField('userAssignRoleByIds', {
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

export const userAssignRoleToUnits = mutationField('userAssignRoleToUnits', {
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

export const userSelectRole = mutationField('userSelectRole', {
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

      return generateToken(payload, process.env.TOKEN_HOURS || '1h');
    } catch (error) {
      throw new Error('Failed to select role: ' + error);
    }
  },
});

export const userRoleSelectUnit = mutationField('userRoleSelectUnit', {
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

      return generateToken(payload, process.env.TOKEN_HOURS || '1h');
    } catch (error) {
      throw new Error('Failed to select role: ' + error);
    }
  },
});

export const userCreateByExcel = mutationField('userCreateByExcel', {
  type: StatusResponseObject,
  description: 'Create users from excel file',
  args: {
    file: 'Upload',
  },
  resolve: async (_, { file }, { prisma }) => {
    try {
      const { createReadStream, filename } = await file;

      if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) {
        throw new Error('File must be an Excel (.xlsx atau .xls)');
      }

      const stream = createReadStream();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const workbook = xlsx.read(buffer, { type: 'buffer' });

      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('First sheet pertama is not found in excel file');
      }
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);

      // console.log('jsonData', jsonData);

      const affectedRows: string[] = [];
      const failedRows: string[] = [];

      for (const row of jsonData as User[]) {
        if (!row.username) {
          throw new Error(`Username cannot be blank`);
        }
        try {
          const existingUser = await prisma.user.findFirst({
            where: {
              username: row.username,
            },
          });

          let newUser = null;

          if (existingUser) {
            newUser = await prisma.user.update({
              where: {
                username: row.username,
              },
              data: {
                name: "" + row.name,
                identity: "" + row.identity,
                email: "" + row.email,
              },
            });
          } else {
            newUser = await prisma.user.create({
              data: {
                uuid: uuidv4(),
                name: "" + row.name,
                username: "" + row.username,
                identity: "" + row.identity,
                email: "" + row.email,
                password: PASSWORD_LOGIN_DEFAULT,
              },
            });
          }

          affectedRows.push("" + row.username);

        } catch (error) {
          throw new Error("" + error);
          failedRows.push("" + row.username || 'UNKNOWN');
        }
      }

      return {
        message: `(${affectedRows.length}) user proceed successfully. (${failedRows.length}) failed.`,
        status: 'success',
        tagsSuccess: affectedRows,
        tagsFailed: failedRows,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error proceed user: ${error.message}`);
      }
      throw new Error(`Error proceed user: ${error}`);
    }
  },
});

export const userTemplateCreateExcel = mutationField('userTemplateCreateExcel', {
  type: 'String',
  description: 'Download template create user ke file Excel',
  resolve: async (_, __, { prisma }) => {
    try {
      const jsonData = [
        {
          username: '',
          name: '',
          identity: '',
          email: '',
        }
      ];

      const worksheet = xlsx.utils.json_to_sheet(jsonData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'User');

      const dir_name = 'downloads';
      const file_name = 'template_create_user.xlsx';

      const filePath = path.join(__dirname + '../../../../', dir_name, file_name);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      xlsx.writeFile(workbook, filePath);

      return path.join('/', dir_name, file_name);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed download template create mahasiswa: ${error.message}`);
      }
      throw new Error(`Failed download template create mahasiswa: ${error}`);
    }
  }
});