{
  description = "A basic flake with a special devShell package";

  inputs = {
    nixpkgs.url = "nixpkgs/22.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { ... }@inputs: inputs.flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import inputs.nixpkgs { inherit system; };
    in
    {
      devShell = pkgs.mkShell {
        buildInputs = with pkgs; [
          cmatrix
        ];
      };
    });
}

