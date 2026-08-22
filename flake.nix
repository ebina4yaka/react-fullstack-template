{
  description = "ts-template — React + ElysiaJS fullstack template (Bun)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        src = self;
      in
      {
        # All JS dependencies pinned by bun.lock, fetched once into the store.
        packages.deps = pkgs.stdenv.mkDerivation {
          name = "ts-template-deps";
          inherit src;

          nativeBuildInputs = [
            pkgs.bun
            pkgs.cacert
          ];

          buildPhase = ''
            export HOME=$TMPDIR
            export XDG_CACHE_HOME=$TMPDIR/.cache
            bun install --frozen-lockfile
          '';

          installPhase = ''
            # keep the node_modules/ directory name so Node/Bun module
            # resolution can climb from <out>/node_modules/<pkg> upward
            mkdir -p $out
            cp -r node_modules $out/node_modules
          '';

          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
          # `nix build .#deps` reports the correct hash on mismatch; paste it here.
          outputHash = "sha256-4OkG6HYCkvUf0/zkMjqnC0UVFK0lpu3IBdo9RJ89o70=";
        };

        # Production frontend build (vite) using the fetched dependencies.
        packages.default = pkgs.stdenv.mkDerivation {
          name = "ts-template-web";
          inherit src;

          nativeBuildInputs = [ pkgs.bun ];

          configurePhase = ''
            # copy (not symlink): bun won't resolve .bin under a symlinked node_modules
            cp -rT ${self.packages.${system}.deps}/node_modules node_modules
            chmod -R u+w node_modules
          '';

          buildPhase = ''
            export HOME=$TMPDIR
            # no /usr/bin/env in the sandbox — have bun execute vite's JS directly
            bun node_modules/vite/bin/vite.js build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r dist/* $out
          '';
        };

        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.bun
            pkgs.nodejs # compatibility for tools expecting node
            pkgs.git
          ];
          shellHook = ''
            echo "ts-template dev shell: bun $(bun --version)"
            [ -d node_modules ] || echo "run 'bun install' first"
          '';
        };
      }
    );
}
