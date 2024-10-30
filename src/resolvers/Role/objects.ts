import { objectType } from 'nexus';
import { Role } from 'nexus-prisma';

export const RoleObject = objectType({
    name: Role.$name,
    description: 'Object representing a role in the system',
    definition(t) {
        t.field(Role.id);
        t.field(Role.name);
        t.field(Role.description);
        t.field(Role.users);
        t.field(Role.permissions);
        t.field(Role.roleUnits);
        t.field(Role.created_at);
        t.field(Role.updated_at);
    },
});

export const RoleListObject = objectType({
    name: 'RoleList',
    description: 'Object representing a paginated list of roles',
    definition(t) {
        t.nonNull.list.nonNull.field('data', {
            type: Role.$name,
            description: 'Array of role objects'
        });
        t.nonNull.int('total', {
            description: 'Total count of roles matching the query'
        });
    },
});