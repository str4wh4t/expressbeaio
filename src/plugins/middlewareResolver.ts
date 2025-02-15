import { plugin } from 'nexus';
import { GraphQLError } from 'graphql';
import { verifyToken } from '../utils/jwt';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type express from 'express';

const filteredTypes = ['Query', 'Mutation'] as const; // Tipe yang akan di-filter

// Tipe untuk memastikan hanya 'Query' dan 'Mutation' yang valid
type FieldTypes = {
    Query: string[];
    Mutation: string[];
};

// Deklarasikan `allowedFields` dengan tipe `FieldTypes`
const nonAuthAllowedFieldTypes: FieldTypes = {
    Query: [], // Memberikan tipe eksplisit pada array kosong
    Mutation: ['login'], // Memberikan tipe eksplisit pada array kosong
};

export const authResolver = plugin({
    name: 'authResolver',
    onCreateFieldResolver(config) {
        const { parentTypeConfig, fieldConfig } = config;
        const parentTypeName = parentTypeConfig.name as keyof typeof nonAuthAllowedFieldTypes; // Nama tipe induk, seperti 'Query' atau 'Mutation'
        const fieldName = fieldConfig.name; // Nama field, seperti 'hello' atau 'createMessage'

        if (
            filteredTypes.includes(parentTypeName) // Mengecek apakah tipe termasuk dalam filteredTypes
            && !nonAuthAllowedFieldTypes[parentTypeName]?.includes(fieldName) // Mengecek apakah field ada dalam daftar filteredFields untuk tipe tersebut
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
                    throw new GraphQLError("Errors : " + error, {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }
            };
        }
        return undefined;
    }
});

const nonAuthRoleAllowedFields: FieldTypes = {
    Query: ['userGet'],
    Mutation: [
        'login',
        // 'userCreate',
        'userUpdate',
        // 'userDelete',
        'userSelectRole',
        // 'userAssignRole',
        'userResetPassword',
        'userChangePassword',
    ],
};

export const authRoleResolver = plugin({
    name: 'authRoleResolver',
    onCreateFieldResolver(config) {
        const { parentTypeConfig, fieldConfig } = config;
        const parentTypeName = parentTypeConfig.name as keyof typeof nonAuthRoleAllowedFields;
        const fieldName = fieldConfig.name;

        if (
            filteredTypes.includes(parentTypeName)
            && !nonAuthRoleAllowedFields[parentTypeName]?.includes(fieldName)
        ) {
            return async (root, args, ctx, info, next) => {
                const token = ctx.request.headers.authorization || '';
                try {
                    const payload = verifyToken(token);
                    if (!payload.selectedRole) {
                        throw new Error('Role not found');
                    }
                    return next(root, args, ctx, info);
                } catch (error) {
                    throw new GraphQLError("Errors : " + error, {
                        extensions: { code: 'UNAUTHENTICATED' },
                    });
                }
            };
        }

        return undefined;
    }
});

const rateLimiter = new RateLimiterMemory({
    points: process.env.RATE_LIMITER_COUNT ? parseInt(process.env.RATE_LIMITER_COUNT) : 10, // Maksimal 10 permintaan
    duration: process.env.RATE_LIMITER_SECONDS ? parseInt(process.env.RATE_LIMITER_SECONDS) : 60, // Dalam 60 detik
});

const getClientIp = (req: express.Request) => {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
        // Ambil IP pertama dari daftar (jika ada banyak proxy)
        if (typeof xForwardedFor === 'string') {
            return xForwardedFor.split(',')[0].trim();
        }
    }
    return req.socket.remoteAddress;
};

const limitedFieldTypes: FieldTypes = {
    Query: [],
    Mutation: ['login'],
};

export const limiterResolver = plugin({
    name: 'limiterResolver',
    onCreateFieldResolver(config) {
        const { parentTypeConfig, fieldConfig } = config;
        const parentTypeName = parentTypeConfig.name as keyof typeof limitedFieldTypes;
        const fieldName = fieldConfig.name;
        if (
            filteredTypes.includes(parentTypeName)
            && limitedFieldTypes[parentTypeName]?.includes(fieldName)
        ) {
            return async (root, args, ctx, info, next) => {
                try {
                    const ip = getClientIp(ctx.request) || '::1';
                    await rateLimiter.consume(ip);
                    return next(root, args, ctx, info);
                } catch (error) {
                    throw new GraphQLError("Errors : " + error, {
                        extensions: { code: 'INTERNAL_SERVER_ERROR' },
                    });
                }
            };
        }
        return undefined;
    }
});