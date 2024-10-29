import { inputObjectType, list, objectType } from 'nexus';
import { Permission } from 'nexus-prisma';

export const PermissionType = objectType({
    name: Permission.$name,
    description: Permission.$description,
    definition(t) {
        t.field(Permission.id);
        t.field(Permission.name);
        t.field(Permission.description);
    }
});

export const ListPermissionType = objectType({
    name: 'ListPermissionType',
    definition(t) {
        t.field('data', { type: list(Permission.$name) });
        t.int('total');
    },
});