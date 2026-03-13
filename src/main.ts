import * as core from "@actions/core";
import { execFileSync } from "child_process";
import { writeFileSync } from "fs";

export async function run(): Promise<void> {
  try {
    const interpreter: string = core.getInput("interpreter");
    const packages: string = core.getInput("packages");
    const flakes: string = core.getInput("flakes");
    const flakesFromDevshell: boolean = core.getBooleanInput(
      "flakes-from-devshell",
    );
    const customDevshell: string = core.getInput("custom-devshell");
    const script: string = core.getInput("script");
    const workingDirectory: string = core.getInput("working-directory");

    const nixWrapperPath = workingDirectory
      ? `./wrapper.sh`
      : `${import.meta.dirname}/wrapper.sh`;
    const scriptPath = workingDirectory
      ? `./script.sh`
      : `${import.meta.dirname}/script.sh`;

    const flakeWrappedPackages = flakesFromDevshell
      ? flakes
      : flakes.split(",").join(" ") ||
        packages
          .split(",")
          .map((pkg) => `nixpkgs#${pkg.trim()}`)
          .join(" ");

    const nixCommand = flakesFromDevshell
      ? customDevshell
        ? `develop .#${customDevshell}`
        : "develop"
      : "shell";

    const nixWrapper = `
set -euo pipefail

nix --experimental-features 'nix-command flakes' ${nixCommand} ${flakeWrappedPackages} -c ${interpreter} ${scriptPath}
      `;

    const wrappedScript = `
set -euo pipefail

${script}
   `;

    writeFileSync(`${workingDirectory}/${nixWrapperPath}`, nixWrapper, {
      mode: 0o755,
    });
    writeFileSync(`${workingDirectory}/${scriptPath}`, wrappedScript, {
      mode: 0o755,
    });

    execFileSync(nixWrapperPath, {
      cwd: workingDirectory || undefined,
      stdio: "inherit",
      shell: "bash",
    });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
