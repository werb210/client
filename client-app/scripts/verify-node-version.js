import semver from "semver";

const requiredRange = ">=20.10.0 <21.0.0";

if (!semver.satisfies(process.version, requiredRange)) {
  console.error(
    `❌ Node version ${process.version} does not satisfy ${requiredRange}`,
  );
  process.exit(1);
}

console.log(`✅ Node version ${process.version} OK`);
