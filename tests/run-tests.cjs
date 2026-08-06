/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const setupPath = path.join(__dirname, "setup-os-user-info.cjs");
const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const nodeOptions = [
    existingNodeOptions,
    `--require=${JSON.stringify(setupPath)}`,
].filter(Boolean).join(" ");

const result = spawnSync(
    process.execPath,
    [
        "--require",
        setupPath,
        path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
        "--test",
        path.join("tests", "cms-hardening.test.ts"),
        path.join("tests", "auth-foundation.test.ts"),
        path.join("tests", "ai-foundation.test.ts"),
    ],
    {
        cwd: process.cwd(),
        env: { ...process.env, NODE_OPTIONS: nodeOptions },
        stdio: "inherit",
    },
);

if (result.error) {
    throw result.error;
}

process.exit(result.status ?? 1);
