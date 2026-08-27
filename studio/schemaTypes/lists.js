import { defineType, defineField, defineArrayMember } from "sanity";
import { text, longText, iconField, numField } from "./_helpers.js";

/* Fixed-length lists live as arrays inside one document so their order is the
 * rendered order — no sort field to maintain. */

export const services = defineType({
  name: "services",
  title: "Services",
  type: "document",
  fields: [defineField({
    name: "items", title: "Services", type: "array",
    of: [defineArrayMember({
      type: "object",
      fields: [numField, text("name", "Name"), iconField(), longText("body", "Body", 3)],
      preview: { select: { title: "name", subtitle: "num" } },
    })],
  })],
  preview: { prepare: () => ({ title: "Services" }) },
});

export const strategies = defineType({
  name: "strategies",
  title: "Strategies",
  type: "document",
  description: "The two tabs under “Our approach”.",
  fields: [defineField({
    name: "items", title: "Strategies", type: "array",
    of: [defineArrayMember({
      type: "object",
      fields: [
        text("name", "Tab name"),
        defineField({
          name: "items", title: "Cards", type: "array",
          of: [defineArrayMember({
            type: "object",
            fields: [text("name", "Name"), iconField()],
            preview: { select: { title: "name", subtitle: "icon" } },
          })],
        }),
      ],
      preview: { select: { title: "name" } },
    })],
  })],
  preview: { prepare: () => ({ title: "Strategies" }) },
});

export const audiences = defineType({
  name: "audiences",
  title: "Formats",
  type: "document",
  description: "The two tabs under “Featured formats”.",
  fields: [defineField({
    name: "items", title: "Audiences", type: "array",
    of: [defineArrayMember({
      type: "object",
      fields: [
        text("name", "Tab name"),
        defineField({
          name: "items", title: "Cards", type: "array",
          of: [defineArrayMember({
            type: "object",
            fields: [numField, text("title", "Title"), longText("body", "Body", 4)],
            preview: { select: { title: "title", subtitle: "num" } },
          })],
        }),
      ],
      preview: { select: { title: "name" } },
    })],
  })],
  preview: { prepare: () => ({ title: "Formats" }) },
});

export const advantages = defineType({
  name: "advantages",
  title: "Advantages",
  type: "document",
  fields: [defineField({
    name: "items", title: "Advantages", type: "array",
    of: [defineArrayMember({
      type: "object",
      fields: [numField, text("title", "Title"), iconField(), longText("body", "Body", 3)],
      preview: { select: { title: "title", subtitle: "num" } },
    })],
  })],
  preview: { prepare: () => ({ title: "Advantages" }) },
});

export const online = defineType({
  name: "online",
  title: "Online learning",
  type: "document",
  fields: [
    defineField({ name: "modules", title: "E-learning modules", type: "array",
      of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "webinars", title: "Webinars", type: "array",
      of: [defineArrayMember({ type: "string" })] }),
  ],
  preview: { prepare: () => ({ title: "Online learning" }) },
});
