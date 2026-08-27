import { defineField } from "sanity";

/* Icon names must match src/_data/icons.js in the site repo. Adding one there
 * and here makes it selectable; content never holds raw SVG path data. */
export const ICON_NAMES = [
  "eye", "chat", "target", "brain", "layers", "clock", "activity", "network",
  "book", "award", "users", "presentation", "heart", "clipboard-check",
  "sliders", "trending-up",
];

export const iconField = (name = "icon") =>
  defineField({
    name,
    title: "Icon",
    type: "string",
    options: { list: ICON_NAMES.map((v) => ({ title: v, value: v })) },
    validation: (Rule) => Rule.required(),
  });

export const text = (name, title, opts = {}) =>
  defineField({ name, title, type: "string", ...opts });

export const longText = (name, title, rows = 3, opts = {}) =>
  defineField({ name, title, type: "text", rows, ...opts });

/* Ordinal shown beside a card ("01"). Kept editable because the design uses it
 * as a label, not a computed index. */
export const numField = defineField({
  name: "num", title: "Number", type: "string",
  validation: (Rule) => Rule.required().max(4),
});
