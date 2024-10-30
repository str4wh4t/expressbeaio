import { objectType } from 'nexus';
import { Permission } from 'nexus-prisma';

export const PermissionObject = objectType({
    name: Permission.$name,
    description: 'Object representing a permission in the system',
    definition(t) {
        t.field(Permission.id);
        t.field(Permission.name);
        t.field(Permission.description);
        t.field(Permission.roles);
        t.field(Permission.created_at);
        t.field(Permission.updated_at);

    },
});

export const PermissionListObject = objectType({
    name: 'PermissionList',
    description: 'Object representing a paginated list of permissions',
    definition(t) {
        t.nonNull.list.nonNull.field('data', {
            type: Permission.$name,
            description: 'Array of permission objects'
        });
        t.nonNull.int('total', {
            description: 'Total count of permissions matching the query'
        });
    },
});