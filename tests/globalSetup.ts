import config from "../src/config";
const { app, databaseConnect } = await import("../src/backend/app");

export async function setup()
{
    await databaseConnect();
    app.listen(config.port);
}

export async function teardown()
{
    
}
