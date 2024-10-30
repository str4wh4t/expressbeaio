import { inputObjectType } from 'nexus';

export const UnitCreateInput = inputObjectType({
    name: 'UnitCreateInput',
    description: 'Input type for creating a new unit',
    definition(t) {
        t.nonNull.string('codename', {
            description: 'Unique codename for the unit (required)'
        });
        t.nonNull.string('name', {
            description: 'Name of the unit (required and unique)'
        });
        t.string('description', {
            description: 'Description explaining the purpose of this unit'
        });
    },
});

export const UnitUpdateInput = inputObjectType({
    name: 'UnitUpdateInput',
    description: 'Input type for updating an existing unit',
    definition(t) {
        t.string('codename', {
            description: 'Updated codename for the unit (must be unique)'
        });
        t.string('name', {
            description: 'Updated name of the unit (must be unique)'
        });
        t.string('description', {
            description: 'Updated description of the unit'
        });
    },
});

export const UnitWhereInput = inputObjectType({
    name: 'UnitWhereInput',
    description: 'Input type for filtering and pagination of units',
    definition(t) {
        t.string('search', {
            description: 'Search term to filter units by codename, name, or description'
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