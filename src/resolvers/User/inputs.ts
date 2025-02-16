import { inputObjectType } from 'nexus';

export const UserCreateInput = inputObjectType({
    name: 'UserCreateInput',
    description: 'Input type for creating a new user',
    definition(t) {
        t.nonNull.string('name', {
            description: 'Full name of the user (required)'
        });
        t.nonNull.string('username', {
            description: 'Username for login (required, unique and min length: 3)'
        });
        t.nonNull.string('identity', {
            description: 'Unique identity number of the user (required and unique)'
        });
        t.nonNull.string('email', {
            description: 'Email address of the user (required and unique)'
        });
        t.nonNull.string('password', {
            description: 'Password for login (required, min length: 8)'
        });
    },
});

export const UserUpdateInput = inputObjectType({
    name: 'UserUpdateInput',
    description: 'Input type for updating an existing user',
    definition(t) {
        t.string('name', {
            description: 'Updated full name'
        });
        // t.string('username', {
        //     description: 'Updated username (unique and min length: 3)'
        // });
        // t.string('identity', {
        //     description: 'Updated identity number (must be unique)'
        // });
        // t.string('email', {
        //     description: 'Updated email address (must be unique)'
        // });
        t.string('password', {
            description: 'Updated password (min length: 8)'
        });
    },
});

export const UserChangePasswordInput = inputObjectType({
    name: 'UserChangePasswordInput',
    description: 'Input type for change password user',
    definition(t) {
        t.string('currentPassword', {
            description: 'Current password for verification (min length: 8)'
        });
        t.string('newPassword', {
            description: 'New password to set (min length: 8)'
        });
    },
});


export const UserWhereInput = inputObjectType({
    name: 'UserWhereInput',
    description: 'Input type for filtering and pagination of users',
    definition(t) {
        t.string('search', {
            description: 'Search term to filter users by name, username, identity, or email'
        });
        t.string('sortBy', {
            description: 'Field name to sort the results by'
        });
        t.boolean('descending', {
            description: 'Sort in descending order if true, ascending if false'
        });
        t.int('take', {
            description: 'Number of records to take (limit)'
        });
        t.int('skip', {
            description: 'Number of records to skip (offset)'
        });
    },
});