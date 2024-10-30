import { objectType } from 'nexus';
import { Unit } from 'nexus-prisma';

export const UnitObject = objectType({
    name: Unit.$name,
    description: 'Object representing a unit in the system',
    definition(t) {
        t.field(Unit.id);
        t.field(Unit.codename);
        t.field(Unit.name);
        t.field(Unit.description);
        t.field(Unit.roleUnits);
        t.field(Unit.created_at);
        t.field(Unit.updated_at);
    },
});

export const UnitListObject = objectType({
    name: 'UnitList',
    description: 'Object representing a paginated list of units',
    definition(t) {
        t.nonNull.list.nonNull.field('data', {
            type: Unit.$name,
            description: 'Array of unit objects'
        });
        t.nonNull.int('total', {
            description: 'Total count of units matching the query'
        });
    },
});