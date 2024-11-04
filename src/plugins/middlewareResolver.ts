import { plugin } from 'nexus';
import { GraphQLError } from 'graphql';
import { verifyToken } from '../utils/jwt';

const filteredTypes = ['Query', 'Mutation'] as const; // Tipe yang akan di-filter

// Tipe untuk memastikan hanya 'Query' dan 'Mutation' yang valid
type AllowedFieldTypes = {
    Query: string[];
    Mutation: string[];
};

// Deklarasikan `allowedFields` dengan tipe `AllowedFieldTypes`
const filteredAuthFields: AllowedFieldTypes = {
    Query: [], // Memberikan tipe eksplisit pada array kosong
    Mutation: ['login', 'loginsso'], // Memberikan tipe eksplisit pada array kosong
};

const filteredRoleFields: AllowedFieldTypes = {
    Query: ['getUser'],
    Mutation: [
        'login',
        // 'createUser',
        'updateUser',
        // 'deleteUser',
        'selectRole',
        // 'assignRole',
        'resetPassword',
        'loginsso',
    ],
};

export const authResolver = plugin({
    name: 'authResolver',
    onCreateFieldResolver(config) {
        const { parentTypeConfig, fieldConfig } = config;
        const parentTypeName_ = parentTypeConfig.name;
        const parentTypeName = parentTypeConfig.name as keyof typeof filteredAuthFields; // Nama tipe induk, seperti 'Query' atau 'Mutation'
        const fieldName = fieldConfig.name; // Nama field, seperti 'hello' atau 'createMessage'

        if (
            filteredTypes.includes(parentTypeName) // Mengecek apakah tipe termasuk dalam filteredTypes
            && !filteredAuthFields[parentTypeName]?.includes(fieldName) // Mengecek apakah field ada dalam daftar filteredFields untuk tipe tersebut
        ) {
            // Middleware resolver yang dijalankan sebelum resolver asli
            return async (root, args, ctx, info, next) => {
                // Cek jika field membutuhkan autentikasi
                // if (config.fieldConfig.extensions?.hasOwnProperty('noAuth')) {
                //     return next(root, args, ctx, info); // Lanjutkan ke resolver asli
                // }
                const token = ctx.request.headers.authorization || '';
                try {
                    verifyToken(token);
                    return next(root, args, ctx, info); // Lanjutkan ke resolver asli
                } catch (error) {
                    throw new GraphQLError("Error : " + error, {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }
            };
        }
        return undefined;
    }
});

export const roleResolver = plugin({
    name: 'roleResolver',
    onCreateFieldResolver(config) {
        const { parentTypeConfig, fieldConfig } = config;
        const parentTypeName = parentTypeConfig.name as keyof typeof filteredRoleFields;
        const fieldName = fieldConfig.name;

        if (
            filteredTypes.includes(parentTypeName)
            && !filteredRoleFields[parentTypeName]?.includes(fieldName)
        ) {
            // Middleware resolver yang dijalankan sebelum resolver asli
            return async (root, args, ctx, info, next) => {
                // Cek jika field membutuhkan autentikasi
                // if (config.fieldConfig.extensions?.hasOwnProperty('noRole')) {
                //     return next(root, args, ctx, info); // Lanjutkan ke resolver asli
                // }
                const token = ctx.request.headers.authorization || '';
                try {
                    const payload = verifyToken(token);
                    if (!payload.selectedRole) {
                        throw new Error('Role not found');
                    }
                    return next(root, args, ctx, info); // Lanjutkan ke resolver asli
                } catch (error) {
                    throw new GraphQLError("Error : " + error, {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }
            };
        }

        return undefined;
    }
});