
set -euo pipefail

nix run nixpkgs.hello nixpkgs.docker -c bash /home/farlion/code/nix/nix-shell-action/dist/script.sh
      