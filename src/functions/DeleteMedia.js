const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("DeleteMedia", {
  methods: ["DELETE"],
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

      const client = new CosmosClient(connStr);
      const container = client.database("footballresultsdbcon").container("mediameta");

      await container.item(id, teamId).delete();

      return { status: 204 };
    } catch (err) {
      context.log.error("Error deleting media:", err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});

