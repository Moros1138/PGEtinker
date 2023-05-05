import { app } from "../lib/expressApp";

let teardown = false

export default async function ()
{
    const server = app.listen(3000);

    return async () =>
    {
        if (teardown)
            throw new Error('teardown called twice')

        teardown = true;
        return new Promise<void>(resolve => server.close(() => resolve()))
    }
}
