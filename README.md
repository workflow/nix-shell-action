# nix-shell-action

<a href="https://github.com/workflow/nix-shell-action/actions"><img alt="nix-shell-action status" src="https://github.com/workflow/nix-shell-action/workflows/nix-shell-action-test/badge.svg"></a>

Run any command you like in a deterministic [Nix](https://nixos.org/nix/) shell on Linux and macOS.

## Usage

Create `.github/workflows/test.yml` in your repo with the following contents:

```yaml
name: "Test"
on:
  pull_request:
  push:
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: cachix/install-nix-action@v18
      with:
        nix_path: nixpkgs=channel:nixos-unstable
    - uses: workflow/nix-shell-action@v3
      with:
        packages: hello,docker
        script: |
          hello
          docker --help
```

You can also pass in environment variables:

```yaml
    - uses: workflow/nix-shell-action@v3
      env:
        TRANSFORMER: bumblecat
      with:
        packages: hello,docker
        script: |
          hello $TRANSFORMER
          docker --help
```

For now, this action implicitly depends on having [Nix] installed and set up correctly, such as through the [install-nix-action] demonstrated in the examples above.

See also [cachix-action](https://github.com/cachix/cachix-action) for a simple binary cache setup to speed up your builds and share binaries with developers.

## Use with Flakes
Instead of specifying packages, you can use `flakes` to specify fully qualified flakes to be available in your script.
This can be used for both local flakes in a `flake.nix` in your repo, as well as external flakes.

```yaml
name: "Test"
on:
  pull_request:
  push:
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Nix
        uses: cachix/install-nix-action@v18
        with:
          extra_nix_config: |
            access-tokens = github.com=${{ secrets.GITHUB_TOKEN }}
      - uses: workflow/nix-shell-action@v3
        with:
          flakes: .#hello,nixpkgs#docker
          script: |
            # Runs hello from a local flake.nix
            hello
            # Uses docker from the nixpkgs registry (see https://raw.githubusercontent.com/NixOS/flake-registry/master/flake-registry.json)
            command -v docker
```

## Options `with: ...`

- `interpreter`:  Interpreter to use in the nix shell shebang, defaults to `bash`. (This is passed to `nix run -c`, used to be `-i` in a nix shell shebang)

- `packages`: Comma-separated list of packages to pre-install in your shell. Defaults to just `bash`. Cannot be used together with the `flakes` option.

- `flakes`: Comma-separated list of fully qualified flakes to pre-install in your shell. Use either `packages` or `flakes`. Cannot be used together with the `packages` option.

- `script`: The actual script to execute in your shell. Will be passed to the `interpreter`, which defaults to `bash`

- `working-directory`: Execute the script inside the specified working directory instead of the repository root. Example: `path/to/dir`

## FAQ: Passing a Github Token against Rate Limits

```yaml
name: "Test"
on:
  pull_request:
  push:
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: cachix/install-nix-action@v18
      with:
        nix_path: nixpkgs=channel:nixos-unstable
        extra_nix_config: |
          access-tokens = github.com=${{ secrets.GITHUB_TOKEN }}
    - uses: workflow/nix-shell-action@v3
      with:
        packages: hello,docker
        script: |
          hello
          docker --help
```

---

## Hacking

See https://github.com/actions/typescript-action

[Nix]: https://nixos.org/nix/
[install-nix-action]: https://github.com/marketplace/actions/install-nix 
