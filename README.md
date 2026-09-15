# pi-preferred-shell-tools

[![npm version](https://img.shields.io/npm/v/pi-preferred-shell-tools?logo=npm)](https://www.npmjs.com/package/pi-preferred-shell-tools)
[![npm license](https://img.shields.io/npm/l/pi-preferred-shell-tools)](./LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/pi-preferred-shell-tools)](https://www.npmjs.com/package/pi-preferred-shell-tools)
[![GitHub Actions](https://github.com/aalexren/pi-preferred-shell-tools/actions/workflows/publish.yml/badge.svg)](https://github.com/aalexren/pi-preferred-shell-tools/actions/workflows/publish.yml)
[![GitHub release](https://img.shields.io/github/v/release/aalexren/pi-preferred-shell-tools?logo=github)](https://github.com/aalexren/pi-preferred-shell-tools/releases)
[![GitHub code size](https://img.shields.io/github/languages/code-size/aalexren/pi-preferred-shell-tools?logo=github)](https://github.com/aalexren/pi-preferred-shell-tools)
[![GitHub top language](https://img.shields.io/github/languages/top/aalexren/pi-preferred-shell-tools?logo=typescript)](https://github.com/aalexren/pi-preferred-shell-tools)

A small [Pi](https://pi.dev) extension that tells the model to prefer modern command-line tools when they are installed.

Its built-in preferences are:

- [`rg`](https://github.com/burntsushi/ripgrep) instead of `grep`
- [`eza`](https://github.com/eza-community/eza) instead of `ls`
- [`fd`](https://github.com/sharkdp/fd) instead of `find`

The extension checks the current environment once per session and appends the available preferences to Pi's existing `bash` entry in the system prompt. It does not replace Pi's built-in tools or require any preferred command to be installed.

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

## License

MIT
