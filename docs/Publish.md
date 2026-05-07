Correct, one package.json can only have one publishConfig.registry default.

Best approach is:

Keep package.json without publishConfig, or keep npmjs as default.
Publish to each registry explicitly with command-level registry override.
Use this workflow:

Publish to npmjs:
npm publish --access public --registry=https://registry.npmjs.org

Publish to GitHub Packages:
npm publish --registry=https://npm.pkg.github.com

Notes:

Same version can be published to both registries.
If you want cleaner auth/routing, put registry rules in .npmrc instead of package.json.
Since npmjs rejected uppercase scope before, keep the package name lowercase as it is now.
If you want, I can update package.json now to remove publishConfig so both publishes are command-driven.