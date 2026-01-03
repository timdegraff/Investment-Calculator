# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.python3
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {
    # This is the critical fix. It exposes the workspace slug as an environment variable.
    WORKSPACE_SLUG = "investment-calculator-931f2";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      "google.gemini-cli-vscode-ide-companion"
      "ms-vscode.js-debug"
    ];
    workspace = {
      # Runs when a workspace is first created with this `dev.nix` file
      onCreate = {
        # Example: install JS dependencies from NPM
        npm-install = "npm install";
      };
      # Runs when a workspace is opened
      onOpen = {
        # Example: start a dev server
        # start-dev-server = "npm run dev";
      };
    };
    # The ports your application uses. This will be published to the cloud.
    ports = [
      {
        port = 8000;
        # Applies when the port is opened in the web preview.
        onOpen = "open-preview";
      }
    ];
  };
}
