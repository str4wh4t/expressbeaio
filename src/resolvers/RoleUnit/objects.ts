import { inputObjectType, list, objectType } from 'nexus';
import { RoleUnit } from 'nexus-prisma';

export const RoleUnitType = objectType({
    name: RoleUnit.$name,
    description: RoleUnit.$description,
    definition(t) {
        t.field(RoleUnit.id);
        t.field(RoleUnit.user);
        t.field(RoleUnit.unit);
        t.field(RoleUnit.role);
    }
});

export const ListRoleUnitType = objectType({
    name: 'ListRoleUnitType',
    definition(t) {
        t.field('data', { type: list(RoleUnit.$name) });
        t.int('total');
    },
});