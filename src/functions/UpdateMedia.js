const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

app.http("UpdateMedia", {
  methods: ["PUT"],
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
      const body = (await request.json().catch(() => ({}))) || {};

      const teamId = body.teamId || request.query.get("teamId");
      if (!teamId) {
        return { status: 400, jsonBody: { error: "teamId is required" } };
      }

      const client = new CosmosClient(connStr);
      const database = client.database("footballresultsdbcon");
      const container = database.container("mediameta");

      const existing = await container.item(id, teamId).read();
      if (!existing.resource) {
        return { status: 404, jsonBody: { error: "Not found" } };
      }

      const updated = {
        ...existing.resource,
        ...body,
        id,          
        teamId,      
        updatedAt: new Date().toISOString()
      };

      await container.items.upsert(updated);

      return { status: 200, jsonBody: updated };
    } catch (err) {
      context.error("UpdateMedia error:", err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
