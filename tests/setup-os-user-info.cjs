/* eslint-disable @typescript-eslint/no-require-imports */
const osModules = [require("node:os"), require("os")];

try {
    osModules[0].userInfo();
} catch {
    for (const os of osModules) {
        Object.defineProperty(os, "userInfo", {
            configurable: true,
            value: () => ({
                uid: -1,
                gid: -1,
                username: process.env.USERNAME || "codex",
                homedir: process.env.USERPROFILE || process.cwd(),
                shell: null,
            }),
        });
    }
}
