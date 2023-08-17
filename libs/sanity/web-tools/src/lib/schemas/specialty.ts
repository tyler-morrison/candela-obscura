import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'specialty',
  title: 'Specialty',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'abilities',
      title: 'Abilities',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'ability' } }],
      // FIXME (Full Release) - Ensure each ability is unique
      validation: (Rule) => Rule.required().length(6),
    }),
    defineField({
      name: 'illuminationKeys',
      title: 'Illumination Keys',
      type: 'array',
      initialValue: () => new Array(3).fill('Available in the full game'),
      of: [
        {
          type: 'string',
          validation: (Rule) => Rule.required(),
        },
      ], // FIXME (Full Release) - Ensure each key is unique
      validation: (Rule) => Rule.length(3),
    }),
  ],
});
