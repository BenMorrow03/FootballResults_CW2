const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("GetMedia", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "media/{id?}",
  handler: async (request, context) => {
    try {
      const connStr = process.env.Cosmos_connection_string;
      if (!connStr) {
        return {
          status: 500,
          jsonBody: { error: "Missing app setting: Cosmos_connection_string" }
        };
      }

      const client = new CosmosClient(connStr);
      const database = client.database("footballresultsdbcon");
      const container = database.container("mediameta");

      const id = request.params.id;

      if (!id) {
        const { resources } = await container.items
          .query("SELECT * FROM c")
          .fetchAll();

        return { status: 200, jsonBody: resources };
      }

      const teamId = request.query.get("teamId");
      if (!teamId) {
        return {
          status: 400,
          jsonBody: { error: "teamId query parameter is required when fetching by id" }
        };
      }

      const { resource } = await container.item(id, teamId).read();
      if (!resource) {
        return { status: 404, jsonBody: { error: "Not found" } };
      }

      return { status: 200, jsonBody: resource };
    } catch (err) {
      context.error("GetMedia error:", err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
