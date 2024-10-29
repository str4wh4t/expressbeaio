import { list, objectType } from 'nexus';
import { Role } from 'nexus-prisma';

export const RoleType = objectType({
    name: Role.$name,
    description: Role.$description,
    definition(t) {
        t.field(Role.id);
        t.field(Role.name);
        t.field(Role.description);
        t.field(Role.users);
        t.field(Role.permissions);
        t.field(Role.roleUnits);
    }
});

export const ListRoleType = objectType({
    name: 'ListRoleType',
    definition(t) {
        t.field('data', { type: list(Role.$name) });
        t.int('total');
    },
});