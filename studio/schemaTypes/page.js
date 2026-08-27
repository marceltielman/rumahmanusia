import { defineType, defineField, defineArrayMember } from "sanity";
import { text, longText } from "./_helpers.js";

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "document",
  fields: [
    text("eyebrow", "Eyebrow"),
    longText("heading", "Heading", 2),
    longText("lead", "Lead paragraph", 3),
    defineField({
      name: "secondaryCta", title: "Secondary button", type: "object",
      fields: [text("label", "Label"), text("href", "Anchor")],
    }),
    defineField({
      name: "tags", title: "Tags", type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "stats", title: "Stat tiles", type: "array",
      description: "Each tile counts up from “from” to “to” when the hero appears.",
      of: [defineArrayMember({
        type: "object",
        fields: [
          defineField({ name: "from", title: "Count from", type: "number" }),
          defineField({ name: "to", title: "Count to", type: "number" }),
          text("suffix", "Suffix", { description: "e.g. “+”" }),
          text("label", "Label"),
        ],
        preview: { select: { title: "label", subtitle: "to" } },
      })],
    }),
    defineField({
      name: "images", title: "Photographs", type: "object",
      fields: [
        defineField({ name: "panel", title: "Panel photo", type: "image",
          options: { hotspot: true } }),
        defineField({ name: "wide", title: "Wide photo", type: "image",
          options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "slots", title: "Placeholder captions", type: "object",
      description: "Shown only while the photo above is empty.",
      fields: [text("panel", "Panel caption"), text("wide", "Wide caption")],
    }),
  ],
  preview: { prepare: () => ({ title: "Hero" }) },
});

const headingGroup = (name, title, extra = []) =>
  defineField({
    name, title, type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      text("eyebrow", "Eyebrow"),
      longText("heading", "Heading", 2),
      longText("lead", "Lead paragraph", 3),
      ...extra,
    ],
  });

export const sections = defineType({
  name: "sections",
  title: "Section headings",
  type: "document",
  description: "The eyebrow, heading and intro copy above each section.",
  fields: [
    defineField({
      name: "clients", title: "Clients", type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [text("eyebrow", "Eyebrow")],
    }),
    headingGroup("vision", "Vision & mission", [
      text("missionEyebrow", "Mission eyebrow"),
      defineField({
        name: "mission", title: "Mission cards", type: "array",
        of: [defineArrayMember({
          type: "object",
          fields: [text("title", "Title"), longText("body", "Body", 3)],
          preview: { select: { title: "title" } },
        })],
      }),
    ]),
    headingGroup("what", "What we do"),
    headingGroup("strategies", "Approach"),
    headingGroup("formats", "Featured formats", [
      defineField({ name: "slots", title: "Placeholder captions", type: "array",
        of: [defineArrayMember({ type: "string" })] }),
      defineField({ name: "images", title: "Photographs", type: "array",
        of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
        validation: (R) => R.max(3) }),
    ]),
    headingGroup("programs", "Programs", [
      text("searchLabel", "Search field label"),
      text("searchPlaceholder", "Search placeholder"),
      longText("emptyNote", "No-results message", 2),
    ]),
    headingGroup("schedule", "Schedule", [
      text("playLabel", "Play button label"),
      text("playHint", "Play hint"),
      text("chartLabel", "Chart caption"),
    ]),
    headingGroup("online", "Online learning", [
      text("modulesLabel", "Modules eyebrow"),
      text("webinarsLabel", "Webinars eyebrow"),
      text("slot", "Placeholder caption"),
      defineField({ name: "image", title: "Photograph", type: "image",
        options: { hotspot: true } }),
    ]),
    headingGroup("advantages", "Advantages"),
    defineField({
      name: "testimony", title: "Testimony", type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [text("eyebrow", "Eyebrow")],
    }),
    headingGroup("team", "Team"),
    headingGroup("cta", "Closing call to action", [
      defineField({ name: "secondary", title: "Secondary button", type: "object",
        fields: [text("label", "Label"), text("href", "Anchor")] }),
    ]),
    headingGroup("contact", "Contact", [
      text("formTitle", "Form title"),
      defineField({
        name: "fields", title: "Form fields", type: "array",
        of: [defineArrayMember({
          type: "object",
          fields: [
            text("name", "Field name", { description: "Used in the submitted email." }),
            text("label", "Label"),
            defineField({ name: "type", title: "Input type", type: "string",
              options: { list: ["text", "email", "tel"] } }),
            text("placeholder", "Placeholder"),
            defineField({ name: "required", title: "Required", type: "boolean" }),
          ],
          preview: { select: { title: "label", subtitle: "name" } },
        })],
      }),
    ]),
  ],
  preview: { prepare: () => ({ title: "Section headings" }) },
});
