const { CosmosClient } = require("@azure/cosmos");
const crypto = require("crypto");

module.exports = async function (context, req) {
  try {
    const body = req.body;

    if (!body || !body.teamId) {
      context.res = {
        status: 400,
        body: { error: "teamId is required" }
      };
      return;
    }

    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);

    const database = client.database("footballresultsdbcon");
    const container = database.container("mediameta");

    const item = {
      id: crypto.randomUUID(),
      teamId: body.teamId,
      title: body.title || "",
      description: body.description || "",
      blobUrl: body.blobUrl || "",
      createdAt: new Date().toISOString()
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
