# nix-shell-action

<a href="https://github.com/workflow/nix-shell-action/actions"><img alt="nix-shell-action status" src="https://github.com/workflow/nix-shell-action/workflows/nix-shell-action-test/badge.svg"></a>

Run any command you like in a deterministic [Nix](https://nixos.org/nix/) shell
on Linux and macOS.

## Usage

Create `.github/workflows/test.yml` in your repo with the following contents:

```yaml
name: 'Test'
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

For now, this action implicitly depends on having [Nix] installed and set up
correctly, such as through the [install-nix-action] demonstrated in the examples
above.

See also [cachix-action](https://github.com/cachix/cachix-action) for a simple
binary cache setup to speed up your builds and share binaries with developers.

## Usage with Flakes

Instead of specifying packages, you can use `flakes` to specify fully qualified
flakes to be available in your script. This can be used for both local flakes in
a `flake.nix` in your repo, as well as external flakes.

```yaml
name: 'Test'
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

## Flakes from devShell

Instead of specifying `flakes`, you can also tell this action to re-use the
`buildInputs` from your `devShell` defined in a `flake.nix`, and automatically
make these available to the script:

```yaml
name: 'Test with Flakes from DevShell'
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
          flakes-from-devshell: true
          script: |
            # Runs hello from a local flake.nix with a `devShell`
            hello
```

# Options `with: ...`

- `interpreter`: Interpreter to use in the nix shell shebang, defaults to
  `bash`. (This is passed to `nix run -c`, used to be `-i` in a nix shell
  shebang)

- `packages`: Comma-separated list of packages to pre-install in your shell.
  Cannot be used together with the `flakes` option.

- `flakes`: Comma-separated list of fully qualified flakes to pre-install in
  your shell. Use either `packages` or `flakes`. Cannot be used together with
  the `packages` option.

- `flakes-from-devshell`: If true, supply flakes from a `devShell` provided in
  your repo's `flake.nix`. You cannot currently combined this with the `flakes`
  nor `packages` options.

- `custom-devshell`: Specify a custom `devShell` to use. This can be useful if
  you have a `devShell` that is not named `devShell` in your `flake.nix`. You
  cannot currently combined this with the `flakes` nor `packages` options.

- `script`: The actual script to execute in your shell. Will be passed to the
  `interpreter`, which defaults to `bash`

- `working-directory`: Execute the script inside the specified working directory
  instead of the repository root. Example: `path/to/dir`

---

# FAQ: Passing a Github Token against Rate Limits

```yaml
name: 'Test'
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

# FAQ: How do I pin a specific version of a package?

See
[This Explanation](https://github.com/workflow/nix-shell-action/issues/346#issuecomment-2440067512)

---

# Hacking

See https://github.com/actions/typescript-action

[nix]: https://nixos.org/nix/
[install-nix-action]: https://github.com/marketplace/actions/install-nix
