const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("UpdateMedia", {
  methods: ["PUT", "PATCH"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const connStr = process.env.Cosmos_connection_string;
      if (!connStr) {
        return { status: 500, jsonBody: { error: "Missing Cosmos_connection_string" } };
      }

      const id = request.query.get("id");
      const teamId = request.query.get("teamId");

      if (!id || !teamId) {
        return { status: 400, jsonBody: { error: "id and teamId are required" } };
      }

      const updates = await request.json().catch(() => ({}));

      const client = new CosmosClient(connStr);
      const container = client.database("footballresultsdbcon").container("mediameta");

      const { resource } = await container.item(id, teamId).read();
      if (!resource) {
        return { status: 404, jsonBody: { error: "Not found" } };
      }

      if (typeof updates.title === "string") resource.title = updates.title;
      if (typeof updates.description === "string") resource.description = updates.description;
      if (typeof updates.blobUrl === "string") resource.blobUrl = updates.blobUrl;

      resource.updatedAt = new Date().toISOString();

      const { resource: saved } = await container.item(id, teamId).replace(resource);

      return { status: 200, jsonBody: saved };
    } catch (err) {
      context.log.error("Error updating media:", err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
