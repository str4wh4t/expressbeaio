import { list, objectType } from 'nexus';
import { User } from 'nexus-prisma';

export const UserType = objectType({
    name: User.$name,
    description: User.$description,
    definition(t) {
        t.field(User.id);
        t.field(User.name);
        t.field(User.username);
        t.field(User.identity);
        t.field(User.email);
        t.field(User.password);
        t.field(User.roles);
        t.field(User.roleUnits);
    }
});

export const ListUserType = objectType({
    name: 'ListUserType',
    definition(t) {
        t.field('data', { type: list(User.$name) });
        t.int('total');
    },
});
