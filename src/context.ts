import { Permission, PrismaClient, Role, User, Unit } from '@prisma/client';
import { verifyToken } from './utils/jwt';
import type express from 'express';
import { enhancePrisma } from './prisma';

export interface Context {
    request: express.Request;
    response: express.Response;
    prisma: PrismaClient;
    userId: number | null;
    roles: string[] | null;
    selectedRole: Role | null;
    selectedUnit: Unit | null;
    permissions: string[] | null;
    isAuthenticated: boolean;
}

type CreateContextParams = {
    req: express.Request;
    res: express.Response;
}

export const createContext = async (params: CreateContextParams): Promise<Context> => {

    const context: Context = {
        request: params.req,
        response: params.res,
        prisma: await enhancePrisma(),
        userId: null,
        roles: null,
        selectedRole: null,
        selectedUnit: null,
        permissions: null,
        isAuthenticated: false,
    }

    if (params.req.headers.authorization) {
        const token = verifyToken(params.req.headers.authorization);

        const userId = token.userId;
        const roles = token.roles;
        const selectedRole = token.selectedRole;
        const selectedUnit = token.selectedUnit;
        const permissions = token.permissions;

        // const user = await (new PrismaClient()).user.findUnique({
        //     where: { id: userId },
        //     include: { roles: true }, // Pastikan roles ter-load
        // });

        // if (!user) {
        //     throw new Error("User not found");
        // }

        context.userId = userId;
        context.roles = roles
        context.selectedRole = selectedRole;
        context.selectedUnit = selectedUnit;
        context.permissions = permissions;
        context.prisma = await enhancePrisma(userId);
        context.isAuthenticated = true;
    }

    return context;
};
