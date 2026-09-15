# pi-preferred-shell-tools

A small [Pi](https://pi.dev) extension that tells the model to prefer modern command-line tools when they are installed.

Its built-in preferences are:

- `rg` instead of `grep`
- `eza` instead of `ls`
- `fd` instead of `find`

The extension checks the current environment once per session and adds only preferences whose commands are available. It does not replace Pi's built-in tools or require any preferred command to be installed.

## Install

```bash
pi install npm:pi-preferred-shell-tools
```

Or install the GitHub version:

```bash
pi install git:github.com/aalexren/pi-preferred-shell-tools
```

## Configure preferences

Add `preferredShellTools` to `~/.pi/agent/settings.json`:

```json
{
  "preferredShellTools": {
    "tools": [
      {
        "command": "bat",
        "instruction": "Use `bat` instead of `cat` when previewing files."
      },
      {
        "command": "jq",
        "instruction": "Use `jq` when inspecting or transforming JSON."
      }
    ]
  }
}
```

Each entry needs a command to detect and the instruction Pi should receive. An entry with the same `command` overrides its built-in version.

To disable one built-in preference:

```json
{
  "preferredShellTools": {
    "tools": [{ "command": "eza", "enabled": false }]
  }
}
```

To start without any built-in preferences and provide only your own:

```json
{
  "preferredShellTools": {
    "includeDefaults": false,
    "tools": [
      {
        "command": "bat",
        "instruction": "Use `bat` instead of `cat` when previewing files."
      }
    ]
  }
}
```

The original array form remains supported and adds entries to the defaults. Project settings in `<project>/.pi/settings.json` work too; project options and entries override matching global values. Settings are read when a session starts.

## Development

```bash
npm install
npm run check
```

## Publish

This is an unscoped package in npm's public registry. Authenticate before publishing:

```bash
npm login
npm publish --access public
```

## License

MIT
