const { CosmosClient } = require("@azure/cosmos");
const crypto = require("crypto");

module.exports = async function (context, req) {
  try {
    // IMPORTANT: match your Azure App Setting name exactly (Linux is case-sensitive)
    const connStr = process.env.Cosmos_connection_string;

    if (!connStr) {
      context.res = {
        status: 500,
        body: {
          error:
            "Cosmos DB connection string missing. Set app setting 'Cosmos_connection_string' in Function App."
        }
      };
      return;
    }

    const body = req.body || {};

    if (!body.teamId) {
      context.res = { status: 400, body: { error: "teamId is required" } };
      return;
    }

    const client = new CosmosClient(connStr);
    const database = client.database("footballresultsdbcon");
    const container = database.container("mediameta");

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

    context.res = {
      status: 201,
      headers: { "Content-Type": "application/json" },
      body: item
    };
  } catch (err) {
    context.log.error("Error creating media:", err);
    context.res = {
      status: 500,
      body: { error: err.message }
    };
  }
};

