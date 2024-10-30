import { objectType } from 'nexus';
import { User } from 'nexus-prisma';

export const UserObject = objectType({
    name: User.$name,
    description: 'Object representing a user in the system',
    definition(t) {
        t.field(User.id);
        t.field(User.name);
        t.field(User.username);
        t.field(User.identity);
        t.field(User.email);
        t.field(User.roles);
        t.field(User.roleUnits);
        t.field(User.eduk_status);
        t.field(User.eduk_foto);
        t.field(User.eduk_unit_1);
        t.field(User.eduk_unit_1_name);
        t.field(User.eduk_unit_2);
        t.field(User.eduk_unit_2_name);
        t.field(User.eduk_unit_3);
        t.field(User.eduk_unit_3_name);
        t.field(User.eduk_gelar_depan);
        t.field(User.eduk_gelar_belakang);
        t.field(User.created_at);
        t.field(User.updated_at);
    },
});

export const UserListObject = objectType({
    name: 'UserList',
    description: 'Object representing a paginated list of users',
    definition(t) {
        t.nonNull.list.nonNull.field('data', {
            type: User.$name,
            description: 'Array of user objects'
        });
        t.nonNull.int('total', {
            description: 'Total count of users matching the query'
        });
    },
});
