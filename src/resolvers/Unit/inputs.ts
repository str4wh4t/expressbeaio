import { inputObjectType } from "nexus";

export const UnitCreateInputType = inputObjectType({
    name: 'UnitCreateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'Unit name' });
        t.nonNull.string('codename', { description: 'Unit codename' });
        t.string('description', { description: 'Unit description' });
    },
});

export const UnitUpdateInputType = inputObjectType({
    name: 'UnitUpdateInput',
    definition(t) {
        t.nonNull.string('name', { description: 'Unit name' });
        t.nonNull.string('codename', { description: 'Unit codename' });
        t.string('description', { description: 'Unit description' });
    },
});