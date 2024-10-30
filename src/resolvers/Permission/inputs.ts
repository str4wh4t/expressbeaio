import { inputObjectType } from 'nexus';

export const PermissionCreateInput = inputObjectType({
    name: 'PermissionCreateInput',
    description: 'Input type for creating a new permission',
    definition(t) {
        t.nonNull.string('name', {
            description: 'Name of the permission (required and unique)'
        });
        t.string('description', {
            description: 'Description explaining the purpose of this permission'
        });
    },
});

export const PermissionUpdateInput = inputObjectType({
    name: 'PermissionUpdateInput',
    description: 'Input type for updating an existing permission',
    definition(t) {
        t.string('name', {
            description: 'Updated name of the permission (must be unique)'
        });
        t.string('description', {
            description: 'Updated description of the permission'
        });
    },
});

export const PermissionWhereInput = inputObjectType({
    name: 'PermissionWhereInput',
    description: 'Input type for filtering and pagination of permissions',
    definition(t) {
        t.string('search', {
            description: 'Search term to filter permissions by name or description'
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