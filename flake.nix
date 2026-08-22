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
        deps = pkgs.stdenv.mkDerivation {
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
            cp -r node_modules $out
          '';

          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
          # `nix build .#deps` reports the correct hash on mismatch; paste it here.
          outputHash = "";
        };

        # Production frontend build (vite) using the fetched dependencies.
        packages.default = pkgs.stdenv.mkDerivation {
          name = "ts-template-web";
          inherit src;

          nativeBuildInputs = [ pkgs.bun ];

          buildInputs = [ self.deps.${system} ];

          configurePhase = ''
            cp -r ${self.deps.${system}} node_modules
          '';

          buildPhase = ''
            bun vite build
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
