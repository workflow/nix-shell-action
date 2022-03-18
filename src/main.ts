import * as core from '@actions/core'
import {execFileSync} from 'child_process'
import {writeFileSync} from 'fs'

function run(): void {
  try {
    const interpreter: string = core.getInput('interpreter')
    const packages: string = core.getInput('packages')
    const script: string = core.getInput('script')

    const nixWrapperPath = `${__dirname}/wrapper.sh`
    const scriptPath = `${__dirname}/script.sh`

    const wrappedPackages = packages
      .split(',')
      .map(pkg => `nixpkgs.${pkg.trim()}`)
      .join(' ')

    const flakeWrappedPackages = packages
      .split(',')
      .map(pkg => `nixpkgs#${pkg.trim()}`)
      .join(' ')

    const nixWrapper = `
set -euo pipefail

echo ${wrappedPackages}
nix run ${wrappedPackages} -c ${interpreter} ${scriptPath} ||
nix --experimental-features 'nix-command flakes' shell ${flakeWrappedPackages} -c ${interpreter} ${scriptPath}
      `

    const wrappedScript = `
set -euo pipefail

${script}
   `

    writeFileSync(nixWrapperPath, nixWrapper, {mode: 0o755})
    writeFileSync(scriptPath, wrappedScript, {mode: 0o755})

    execFileSync(nixWrapperPath, {
      stdio: 'inherit',
      shell: 'bash'
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
