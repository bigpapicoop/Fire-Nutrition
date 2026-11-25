// `npm run ship`: check the app builds, then save your changes to GitHub.
// GitHub then publishes it to https://bigpapicoop.github.io/Fire-Nutrition/ automatically (about a minute).
// Optional message: npm run ship -- "Added turkey chili"
import { execSync } from 'node:child_process'

const SITE = 'https://bigpapicoop.github.io/Fire-Nutrition/'
const ACTIONS = 'https://github.com/bigpapicoop/Fire-Nutrition/actions'

const message = process.argv.slice(2).join(' ').trim() || 'Update app'
const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const quiet = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()

console.log('\n1/2  Checking the app builds (so a broken version never goes live)...')
run('npm run build')

console.log('\n2/2  Saving to GitHub...')
run('git add -A')
if (quiet('git status --porcelain')) {
  run(`git commit -q -m ${JSON.stringify(message)}`)
} else {
  console.log('No new changes to save.')
}
run('git push -q')

console.log(`\nDone! GitHub is publishing it now. It's live in about a minute at:\n  ${SITE}`)
console.log(`Watch progress here: ${ACTIONS}`)
console.log('Open phones will show "Update now" within a few minutes.\n')
