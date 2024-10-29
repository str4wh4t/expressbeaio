import { inputObjectType } from "nexus";

export const RoleCreateInputType = inputObjectType({
    name: 'RoleCreateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'Role name' });
        t.string('description', { description: 'Role description' });
    },
});

export const RoleUpdateInputType = inputObjectType({
    name: 'RoleUpdateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'Role name' });
        t.string('description', { description: 'Role description' });
    },
});