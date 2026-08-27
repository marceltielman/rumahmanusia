import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes, SINGLETONS } from "./schemaTypes/index.js";

/* Every type here is a singleton: the site is one page, so there is exactly one
 * Services document, one Schedule, and so on. The desk is built explicitly so
 * editors get a flat list of page areas rather than "create new" buttons that
 * would produce a second copy of a section. */
export default defineConfig({
  name: "default",
  title: "Rumah Manusia",
  projectId: "k01eodu7",
  dataset: "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items(
            SINGLETONS.map(({ id, title, icon }) =>
              S.listItem()
                .title(title)
                .id(id)
                .child(S.document().schemaType(id).documentId(id).title(title))
            )
          ),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide singletons from global "create" menus.
    templates: (prev) => prev.filter((t) => !SINGLETONS.some((s) => s.id === t.schemaType)),
  },

  document: {
    actions: (prev) =>
      prev.filter(({ action }) => !["duplicate", "delete", "unpublish"].includes(action)),
  },
});
