import semver from "semver"

const requiredRange = ">=20.10.0 <21.0.0"
const current = process.version

if (!semver.satisfies(current, requiredRange)) {
  console.error(`❌ Node ${current} does not satisfy ${requiredRange}`)
  process.exit(1)
}

console.log(`✅ Node ${current} OK`)
