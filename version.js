import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

let hash = createHash("sha256");
hash.update((new Date().getTime() / 1000).toString());

writeFile(
    path.join("./", "resources", "js", "lib", "version.js"),
    `
        const version = "${hash.digest().toString('hex')}";
        export default version;
    `
);
