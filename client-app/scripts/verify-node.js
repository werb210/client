import semver from "semver"

const required = ">=20.10 <23"

if (!semver.satisfies(process.version, required)) {
  console.error(`Node ${required} required. Current: ${process.version}`)
  process.exit(1)
}
