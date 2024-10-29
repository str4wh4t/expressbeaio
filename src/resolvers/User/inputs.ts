import { inputObjectType } from "nexus";

export const UserCreateInputType = inputObjectType({
    name: 'UserCreateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'User fullname' });
        t.nonNull.string('username', { description: 'User username' });
        t.nonNull.string('identity', { description: 'User identity' });
        t.nonNull.string('email', { description: 'User email' });
        t.nonNull.string('password', { description: 'User password' });
    },
});

export const UserUpdateInputType = inputObjectType({
    name: 'UserUpdateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'User fullname' });
        t.nonNull.string('password', { description: 'User password' });
    },
});