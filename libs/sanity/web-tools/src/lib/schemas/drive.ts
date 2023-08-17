import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'drive',
  title: 'Drive',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'actions',
      title: 'Actions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: { type: 'action' },
          options: { disableNew: true },
        },
      ],
      validation: (Rule) => Rule.required().unique().length(3),
    }),
    defineField({
      name: 'driveAvailable',
      title: 'Drives',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      validation: Rule => Rule.precision(0).positive().max(9)
    }),
    defineField({
      name: 'driveMax',
      title: 'Max',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      validation: Rule => Rule.precision(0).positive().max(9)
    }),
    defineField({
      name: 'resistanceAvailable',
      title: 'Resistances',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      validation: Rule => Rule.precision(0).positive().max(3)
    }),
    defineField({
      name: 'resistanceMax',
      title: 'Max',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      validation: Rule => Rule.precision(0).positive().max(3)
    })
  ],
});
