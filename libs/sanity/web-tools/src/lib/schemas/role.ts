import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'specialty' },
          options: {
            disableNew: true,
          },
        },
      ],
      validation: (Rule) => Rule.required().unique(),
    }),
    defineField({
      name: 'abilities',
      title: 'Abilities',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'ability' } }],
      // FIXME (Full Release) - Ensure each ability is unique
      validation: (Rule) => Rule.required().length(3),
    }),
  ],
});
