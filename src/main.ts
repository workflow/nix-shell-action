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

verlte() {
    [  "$1" = "$(echo -e "$1\n$2" | sort -V | head -n1)" ]
}

verlt() {
    [ "$1" = "$2" ] && return 1 || verlte $1 $2
}

nix_version=$(nix --version | awk '{ print $3 }')

if verlt $nix_version 2.4
then
  # before nix 2.4: nix run
  nix run ${wrappedPackages} -c ${interpreter} ${scriptPath}
else
  # nix 2.4 and later: nix shell
  nix --experimental-features 'nix-command flakes' shell ${flakeWrappedPackages} -c ${interpreter} ${scriptPath} 
fi
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
