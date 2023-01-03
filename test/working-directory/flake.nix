{
  description = "A very basic flake";

  outputs = { self, nixpkgs }: {

    packages.x86_64-linux.cowsay = nixpkgs.legacyPackages.x86_64-linux.cowsay;

    packages.x86_64-linux.default = self.packages.x86_64-linux.cowsay;

  };
}
