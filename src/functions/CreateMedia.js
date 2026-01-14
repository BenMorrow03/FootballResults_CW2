const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");
const crypto = require("crypto");

app.http("CreateMedia", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const connStr = process.env.Cosmos_connection_string;
      if (!connStr) return { status: 500, jsonBody: { error: "Missing Cosmos_connection_string" } };

      const body = await request.json().catch(() => ({}));
      if (!body.teamId) return { status: 400, jsonBody: { error: "teamId is required" } };

      const client = new CosmosClient(connStr);
      const container = client.database("footballresultsdbcon").container("mediameta");

      const now = new Date().toISOString();
      const item = {
        id: body.id || crypto.randomUUID(),
        teamId: body.teamId,
        title: body.title || "",
        description: body.description || "",
        blobUrl: body.blobUrl || "",
        createdAt: now,
        updatedAt: now
      };

      await container.items.create(item);
      return { status: 201, jsonBody: item };
    } catch (err) {
      context.log.error(err);
      return { status: 500, jsonBody: { error: err.message } };
    }
  }
});
