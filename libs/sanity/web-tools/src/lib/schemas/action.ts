import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'action',
  title: 'Action',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'maneuvers',
      title: 'Maneuvers',
      type: 'array',
      of: [
        {
          type: 'string',
          validation: (Rule) => Rule.required().lowercase(),
        },
      ],
      validation: (Rule) => Rule.unique().length(3),
    }),
    defineField({
      name: 'gilded',
      title: 'Is this action gilded?',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      validation: Rule => Rule.precision(0).positive().max(3)
    }),
  ]
})
