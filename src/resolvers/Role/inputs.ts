import { inputObjectType } from 'nexus';

export const RoleCreateInput = inputObjectType({
    name: 'RoleCreateInput',
    description: 'Input type for creating a new role',
    definition(t) {
        t.nonNull.string('name', {
            description: 'Name of the role (required and unique)'
        });
        t.string('description', {
            description: 'Description explaining the purpose of this role'
        });
        t.list.nonNull.int('permissionIds', {
            description: 'List of permission IDs to assign to this role'
        });
    },
});

export const RoleUpdateInput = inputObjectType({
    name: 'RoleUpdateInput',
    description: 'Input type for updating an existing role',
    definition(t) {
        t.string('name', {
            description: 'Updated name of the role (must be unique)'
        });
        t.string('description', {
            description: 'Updated description of the role'
        });
        t.list.nonNull.int('permissionIds', {
            description: 'Updated list of permission IDs for this role'
        });
    },
});

export const RoleWhereInput = inputObjectType({
    name: 'RoleWhereInput',
    description: 'Input type for filtering and pagination of roles',
    definition(t) {
        t.string('search', {
            description: 'Search term to filter roles by name or description'
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