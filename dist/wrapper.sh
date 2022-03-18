
set -euo pipefail

echo nixpkgs.
nix run nixpkgs. -c  /home/farlion/code/nix/nix-shell-action/lib/script.sh ||
nix --experimental-features 'nix-command flakes' shell nixpkgs# -c  /home/farlion/code/nix/nix-shell-action/lib/script.sh
      