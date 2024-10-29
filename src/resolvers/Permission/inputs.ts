import { inputObjectType } from "nexus";

export const PermissionCreateInputType = inputObjectType({
    name: 'PermissionCreateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'Permission name' });
        t.string('description', { description: 'Permission description' });
    },
});

export const PermissionUpdateInputType = inputObjectType({
    name: 'PermissionUpdateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'Permission name' });
        t.string('description', { description: 'Permission description' });
    },
});