import { app } from "../lib/expressApp";

let server: any;

export function setup()
{
    server = app.listen(3000);
}

export function teardown()
{
    server.close();
}
