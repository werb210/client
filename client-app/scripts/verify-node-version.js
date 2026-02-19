const requiredRange = ">=20.10.0 <21.0.0";

function parseVersion(version) {
  const normalized = version.replace(/^v/, "");
  const [major, minor, patch] = normalized.split(".").map(Number);
  return { major, minor, patch };
}

function isAtLeast(version, min) {
  if (version.major !== min.major) return version.major > min.major;
  if (version.minor !== min.minor) return version.minor > min.minor;
  return version.patch >= min.patch;
}

const current = parseVersion(process.version);
const min = parseVersion("20.10.0");
const maxMajorExclusive = 21;
const isSupported = isAtLeast(current, min) && current.major < maxMajorExclusive;

if (!isSupported) {
  console.error(`❌ Node version ${process.version} does not satisfy ${requiredRange}`);
  process.exit(1);
}

console.log(`✅ Node version ${process.version} OK`);
