import { inputObjectType, list, objectType } from 'nexus';
import { Unit } from 'nexus-prisma';

export const UnitType = objectType({
    name: Unit.$name,
    description: Unit.$description,
    definition(t) {
        t.field(Unit.id);
        t.field(Unit.codename);
        t.field(Unit.name);
        t.field(Unit.description);
        t.field(Unit.roleUnits);
    }
});

export const ListUnitType = objectType({
    name: 'ListUnitType',
    definition(t) {
        t.field('data', { type: list(Unit.$name) });
        t.int('total');
    },
});