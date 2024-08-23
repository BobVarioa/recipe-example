import fs from "node:fs";
import esbuild from "esbuild";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server.js";
import { createRequire } from 'module';

const emptyCss = {
	name: "empty-css-imports",
	setup(build) {
		build.onLoad({ filter: /\.css$/ }, () => ({ contents: "" }));
	},
};

const esbuildOpts = {
	bundle: true,
	platform: "browser",
	format: "esm",
	define: { "globalThis.DEBUG": process.env.DEBUG ? 'true' : 'false' },
};

await esbuild.build({
	...esbuildOpts,
	platform: "node",
	entryPoints: ["./src/index.server.ts"],
	outfile: "./dist/index.server.mjs",
	plugins: [emptyCss],
	format: "esm",
	external: ["react", "react-dom", "lexical", "@lexical", "react-router"]
});

globalThis.require = createRequire(import.meta.url)

const { Root } = await import("../dist/index.server.mjs");

const indexHtml = fs.readFileSync("./static/index.template.html").toString();

const element = renderToString(
	createElement(StaticRouter, { location: "/" }, 
		createElement(Root)
	)
);

fs.writeFileSync(
	"./dist/index.html",
	indexHtml.replace("{react-root}", element)
);

fs.unlinkSync("./dist/index.server.mjs");

await esbuild.build({
	...esbuildOpts,
	entryPoints: ["./src/index.client.tsx"],
	outfile: "./dist/index.js",
	minify: true,
});

