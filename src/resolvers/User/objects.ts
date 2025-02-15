import { objectType } from 'nexus';
import { User } from 'nexus-prisma';

export const UserObject = objectType({
    name: User.$name,
    description: 'Object representing a user in the system',
    definition(t) {
        t.field(User.id);
        t.field(User.uuid);
        t.field(User.name);
        t.field(User.username);
        t.field(User.identity);
        t.field(User.email);
        t.field(User.roles);
        t.field(User.roleUnits);
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

export const StatusResponseObject = objectType({
    name: 'StatusResponse', // Nama tipe output
    definition(t) {
        t.string('status'); // Field status
        t.string('message'); // Field message
        t.nullable.list.string('tagsSuccess'); // Tags for success
        t.nullable.list.string('tagsFailed'); // Tags for failed
    },
});
