{
  description = "A very basic flake";

  outputs = {
    self,
    nixpkgs,
  }: {
    packages.x86_64-linux.hello = nixpkgs.legacyPackages.x86_64-linux.hello;

    packages.x86_64-linux.default = self.packages.x86_64-linux.hello;

    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [nixpkgs.legacyPackages.x86_64-linux.figlet];
    };

    ci = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [nixpkgs.legacyPackages.x86_64-linux.ponysay];
    };
  };
}
