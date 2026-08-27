import { defineType, defineField, defineArrayMember } from "sanity";
import { text, longText } from "./_helpers.js";

export const site = defineType({
  name: "site",
  title: "Site",
  type: "document",
  groups: [
    { name: "brand", title: "Brand", default: true },
    { name: "contact", title: "Contact" },
    { name: "nav", title: "Navigation" },
    { name: "tuning", title: "Behaviour" },
  ],
  fields: [
    text("title", "Browser title", { group: "brand", validation: (R) => R.required() }),
    longText("description", "Meta description", 3, { group: "brand" }),
    text("wordmark", "Wordmark", { group: "brand" }),
    text("tagline", "Tagline", { group: "brand" }),
    text("cta", "Primary button label", { group: "brand" }),
    text("themeColor", "Browser theme colour", { group: "brand" }),

    text("email", "Enquiry email", { group: "contact" }),
    text("whatsapp", "WhatsApp number", {
      group: "contact",
      description: "International format, no plus or spaces — e.g. 6281990095350",
    }),
    defineField({
      name: "quickAsks", title: "WhatsApp quick questions", type: "array", group: "contact",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "contacts", title: "Contact rows", type: "array", group: "contact",
      of: [defineArrayMember({
        type: "object",
        fields: [text("label", "Label"), text("value", "Value")],
        preview: { select: { title: "label", subtitle: "value" } },
      })],
    }),
    defineField({
      name: "offices", title: "Offices", type: "array", group: "contact",
      of: [defineArrayMember({
        type: "object",
        fields: [
          text("city", "City"),
          defineField({ name: "address", title: "Address lines", type: "array",
            of: [defineArrayMember({ type: "string" })] }),
        ],
        preview: { select: { title: "city" } },
      })],
    }),

    defineField({
      name: "nav", title: "Header links", type: "array", group: "nav",
      of: [defineArrayMember({
        type: "object",
        fields: [text("label", "Label"), text("href", "Anchor")],
        preview: { select: { title: "label", subtitle: "href" } },
      })],
    }),
    defineField({
      name: "footer", title: "Footer", type: "object", group: "nav",
      fields: [
        defineField({ name: "services", title: "Services column", type: "array",
          of: [defineArrayMember({ type: "string" })] }),
        defineField({ name: "explore", title: "Explore column", type: "array",
          of: [defineArrayMember({ type: "object",
            fields: [text("label", "Label"), text("href", "Anchor")],
            preview: { select: { title: "label" } } })] }),
        defineField({ name: "follow", title: "Follow column", type: "array",
          of: [defineArrayMember({ type: "string" })] }),
        text("legal", "Legal line"),
      ],
    }),

    defineField({
      name: "programColumns", title: "Program grid columns", type: "number",
      group: "tuning", validation: (R) => R.min(1).max(4),
    }),
    defineField({
      name: "collapsedPrograms", title: "Programs shown before “Show all”",
      type: "number", group: "tuning", validation: (R) => R.min(1),
    }),
    defineField({
      name: "autoplayMs", title: "Schedule autoplay interval (ms)", type: "number",
      group: "tuning", validation: (R) => R.min(500),
    }),
  ],
  preview: { prepare: () => ({ title: "Site" }) },
});
