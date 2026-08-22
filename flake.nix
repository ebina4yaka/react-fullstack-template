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
      in
      {
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
