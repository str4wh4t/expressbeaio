import { inputObjectType } from 'nexus';

export const RoleUnitCreateInput = inputObjectType({
    name: 'RoleUnitCreateInput',
    description: 'Input type for creating a new role-unit assignment',
    definition(t) {
        t.nonNull.int('user_id', {
            description: 'ID of the user to assign (required)'
        });
        t.nonNull.int('unit_id', {
            description: 'ID of the unit to assign (required)'
        });
        t.nonNull.int('role_id', {
            description: 'ID of the role to assign (required)'
        });
    },
});

export const RoleUnitUpdateInput = inputObjectType({
    name: 'RoleUnitUpdateInput',
    description: 'Input type for updating an existing role-unit assignment',
    definition(t) {
        t.int('user_id', {
            description: 'Updated user ID'
        });
        t.int('unit_id', {
            description: 'Updated unit ID'
        });
        t.int('role_id', {
            description: 'Updated role ID'
        });
    },
});

export const RoleUnitWhereInput = inputObjectType({
    name: 'RoleUnitWhereInput',
    description: 'Input type for filtering and pagination of role-unit assignments',
    definition(t) {
        t.int('user_id', {
            description: 'Filter by user ID'
        });
        t.int('unit_id', {
            description: 'Filter by unit ID'
        });
        t.int('role_id', {
            description: 'Filter by role ID'
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