const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("DeleteMedia", {
  methods: ["DELETE"],
  authLevel: "anonymous",
  route: "media/{id}",
  handler: async (request, context) => {
    try {
      const connStr = process.env.Cosmos_connection_string;
      if (!connStr) {
        return {
          status: 500,
          jsonBody: { error: "Missing app setting: Cosmos_connection_string" }
        };
      }

      const id = request.params.id;
      const teamId = request.query.get("teamId");

      if (!teamId) {
        return {
          status: 400,
          jsonBody: { error: "teamId query parameter is required to delete (partition key)" }
        };
      }

      const client = new CosmosClient(connStr);
      const database = client.database("footballresultsdbcon");
      const container = database.container("mediameta");

      await container.item(id, teamId).delete();

      return { status: 204 };
    } catch (err) {
      context.error("DeleteMedia error:", err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
