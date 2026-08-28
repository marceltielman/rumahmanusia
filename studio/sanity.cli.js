import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: { projectId: "k01eodu7", dataset: "production" },

  /* Hosted Studio address. Set here so `sanity deploy` is not interactive and
     the hostname cannot drift between machines. */
  studioHost: "rumahmanusia",

  /* Pinned so redeploys never prompt for the application id. */
  deployment: { appId: "sb58u04ufse9wit1lio3x6bn" },
});
