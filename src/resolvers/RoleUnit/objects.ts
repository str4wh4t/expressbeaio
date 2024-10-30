import { objectType } from 'nexus';
import { RoleUnit } from 'nexus-prisma';

export const RoleUnitObject = objectType({
    name: RoleUnit.$name,
    description: 'Object representing a role-unit assignment in the system',
    definition(t) {
        t.field(RoleUnit.id);
        t.field(RoleUnit.user);
        t.field(RoleUnit.user_id);
        t.field(RoleUnit.unit);
        t.field(RoleUnit.unit_id);
        t.field(RoleUnit.role);
        t.field(RoleUnit.role_id);
        t.field(RoleUnit.created_at);
        t.field(RoleUnit.updated_at);
    },
});

export const RoleUnitListObject = objectType({
    name: 'RoleUnitList',
    description: 'Object representing a paginated list of role-unit assignments',
    definition(t) {
        t.nonNull.list.nonNull.field('data', {
            type: RoleUnit.$name,
            description: 'Array of role-unit assignment objects'
        });
        t.nonNull.int('total', {
            description: 'Total count of role-unit assignments matching the query'
        });
    },
});