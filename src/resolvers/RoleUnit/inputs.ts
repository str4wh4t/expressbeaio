import { inputObjectType } from "nexus";

export const RoleUnitCreateInputType = inputObjectType({
    name: 'RoleUnitCreateInput',
    definition(t) {
        t.nonNull.int('user_id', { description: 'RoleUnit user_id' });
        t.nonNull.int('unit_id', { description: 'RoleUnit unit_id' });
        t.nonNull.int('role_id', { description: 'RoleUnit role_id' });
    },
});

export const RoleUnitUpdateInputType = inputObjectType({
    name: 'RoleUnitUpdateInput',
    definition(t) {
        t.nonNull.int('user_id', { description: 'RoleUnit user_id' });
        t.nonNull.int('unit_id', { description: 'RoleUnit unit_id' });
        t.nonNull.int('role_id', { description: 'RoleUnit role_id' });
    },
});