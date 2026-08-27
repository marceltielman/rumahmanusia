import { defineType, defineField, defineArrayMember } from "sanity";
import { text, longText } from "./_helpers.js";

export const programs = defineType({
  name: "programs",
  title: "Programs",
  type: "document",
  fields: [defineField({
    name: "tracks", title: "Tracks", type: "array",
    of: [defineArrayMember({
      type: "object",
      fields: [
        text("name", "Track name"),
        defineField({
          name: "programs", title: "Programs", type: "array",
          description: "Order here is the order on the page; numbering is automatic.",
          of: [defineArrayMember({ type: "string" })],
        }),
      ],
      preview: {
        select: { title: "name", programs: "programs" },
        prepare: ({ title, programs }) =>
          ({ title, subtitle: `${(programs || []).length} programs` }),
      },
    })],
  })],
  preview: { prepare: () => ({ title: "Programs" }) },
});

export const schedule = defineType({
  name: "schedule",
  title: "Schedule",
  type: "document",
  description: "Public runs. Charts and labels are generated from the month value.",
  fields: [defineField({
    name: "months", title: "Months", type: "array",
    of: [defineArrayMember({
      type: "object",
      fields: [
        defineField({
          name: "month", title: "Month", type: "string",
          description: "Year and month as YYYY-MM, e.g. 2026-08.",
          validation: (R) => R.required().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
            name: "YYYY-MM",
          }),
        }),
        defineField({ name: "topics", title: "Topics", type: "array",
          of: [defineArrayMember({ type: "string" })] }),
      ],
      preview: {
        select: { title: "month", topics: "topics" },
        prepare: ({ title, topics }) =>
          ({ title, subtitle: `${(topics || []).length} topics` }),
      },
    })],
  })],
  preview: { prepare: () => ({ title: "Schedule" }) },
});

export const testimonials = defineType({
  name: "testimonials",
  title: "Testimonials",
  type: "document",
  fields: [defineField({
    name: "items", title: "Testimonials", type: "array",
    of: [defineArrayMember({
      type: "object",
      fields: [
        longText("quote", "Quote", 4),
        text("source", "Attribution"),
        defineField({
          name: "lang", title: "Language", type: "string",
          description: "Marks the quote for screen readers. Most are Indonesian.",
          options: { list: [{ title: "Indonesian", value: "id" }, { title: "English", value: "en" }] },
          initialValue: "id",
        }),
      ],
      preview: { select: { title: "source", subtitle: "quote" } },
    })],
  })],
  preview: { prepare: () => ({ title: "Testimonials" }) },
});

export const clients = defineType({
  name: "clients",
  title: "Clients",
  type: "document",
  fields: [
    defineField({
      name: "featured", title: "Logo marquee", type: "array",
      description: "Shown as scrolling tiles. Upload a logo, or leave it empty to fall back to the site's favicon.",
      of: [defineArrayMember({
        type: "object",
        fields: [
          text("name", "Name"),
          text("domain", "Domain", { description: "e.g. bca.co.id" }),
          defineField({ name: "logo", title: "Logo", type: "image" }),
        ],
        preview: { select: { title: "name", subtitle: "domain", media: "logo" } },
      })],
    }),
    defineField({
      name: "all", title: "Client list", type: "array",
      description: "Shown as text pills below the marquee.",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: { prepare: () => ({ title: "Clients" }) },
});

export const team = defineType({
  name: "team",
  title: "Team",
  type: "document",
  fields: [
    defineField({
      name: "founder", title: "Founder", type: "object",
      fields: [
        text("name", "Name"),
        text("role", "Role"),
        defineField({ name: "photo", title: "Photo", type: "image",
          options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "members", title: "Trainers & coaches", type: "array",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "photo", title: "Photo", type: "image",
            options: { hotspot: true } }),
          text("name", "Name", { description: "Optional — used as the image alt text." }),
        ],
        preview: {
          select: { title: "name", media: "photo" },
          prepare: ({ title, media }) => ({ title: title || "Trainer", media }),
        },
      })],
    }),
    longText("note", "Caption below the grid", 3),
  ],
  preview: { prepare: () => ({ title: "Team" }) },
});
