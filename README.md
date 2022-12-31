<img src="https://github.com/phil1436/ownvscodeextension/raw/master/resources/logo.png" width="25%"/>

# OwnVscodeExtension

Providing tools for VSCode.

---

* [Features](https://github.com/phil1436/OwnVscodeExtension#features)
  * [Move Selection](https://github.com/phil1436/OwnVscodeExtension#move-selection)
  * [Translate Text](https://github.com/phil1436/OwnVscodeExtension#translate-text)
  * [Working with Snapshots](https://github.com/phil1436/OwnVscodeExtension#working-with-snapshots)
* [Installation](https://github.com/phil1436/OwnVscodeExtension#installation)
* [Commands](https://github.com/phil1436/OwnVscodeExtension#commands)
  * [Own Vscode Move](https://github.com/phil1436/OwnVscodeExtension#own-vscode-move)
  * [Own VScode Translate](https://github.com/phil1436/OwnVscodeExtension#own-vscode-translate)
  * [Own VScode Snapshot](https://github.com/phil1436/OwnVscodeExtension#own-vscode-snapshot)
* [Configuration](https://github.com/phil1436/OwnVscodeExtension#configuration)
  * [Snapshot](https://github.com/phil1436/OwnVscodeExtension#snapshot)
  * [Translate](https://github.com/phil1436/OwnVscodeExtension#translate)
* [Bugs](https://github.com/phil1436/OwnVscodeExtension#bugs)
* [Release Notes](https://github.com/phil1436/OwnVscodeExtension#release-notes)

---

## Features

### Move Selection

Move the selected text to a direction in the same line.

> Keyboard Shortcut: `Alt + LeftArrow|RightArrow` *(Mac: `Options + LeftArrow|RightArrow`)*

### Translate Text

Translates the selected text to a specified language.

### Working with Snapshots

Create Snapshots of your current opened file, so you can restore it later.

---

## Installation

* Clone this repository (recommended under `~/.vscode/extensions`):

````shell
git clone https://github.com/phil1436/ownvscodeextension C:\Users\<your-user>\.vscode\extensions\ownvscodeextension
````

or download the [latest realease](https://github.com/phil1436/ownvscodeextension/releases/latest) and extract the file into `~/.vscode/extensions`.

* Then go into the project folder an run:

````shell
npm install
````

* If the extension didnt get installed run the command `Developer: Install Extension from Location...` and choose the extension folder.

---

## Commands

### Own Vscode Move

* `Move Selection To Left`: Moves selected text to the left. (`Alt+LeftArrow`)
* `Move Selection To Right`: Moves selected text to the right. (`Alt+RightArrow`)

### Own VScode Translate

* `Translate Selection`: Translates selected text.

### Own VScode Snapshot

* `Create Snapshot of Active File`: Create a snapshot of your active file. You can specify a optional name for identification (leave empty if not needed).
* `Restore Snapshot of Active File`: Overwrites your active file with the snapshot.
* `Delete Snapshot`: Deletes a snapshot.
* `Delete All Snapshots from Active File`: Deletes all snapshot that are saved for the active file.
* `Delete All Snapshots`: Deletes all snapshots.
* `View Snapshot`: View a snapshot.
* `View Snapshot of Active File`: View a snapshot of your active file.

---

## Configuration

Go to `File > Preferences > Settings` and than navigate to `Extensions > OwnVscodeExtension`.

### Snapshot

* `Create Snapshot When Restore`: If enabled creates a snapshot of the active file when a snapshot get restored (Default: *enabled*).
* `Delete Snapshot After Restore`: If enabled deletes a snapshot after it gets restored (Default: *disabled*).

### Translate

* `Default Translate`: Default translate configuration for [Own Vscode Translate: Translate Selection](https://github.com/phil1436/OwnVscodeExtension#own-vscode-translate). Value is a array of objects:

````
[
  {"from":"en","to":"de"},
  {"from":"en","to":"es"} ...
]
````

Edit via *Edit in settings.json*.

---

## Bugs

* *no known bugs*

---

## [Release Notes](https://github.com/phil1436/ownvscodeextension/blob/master/CHANGELOG.md)

### [v0.0.2](https://github.com/phil1436/ownvscodeextension/tree/0.0.2)

* Bug fixes
* Insert Configurations
* Command Categories added
* Commands added

### [v0.0.1](https://github.com/phil1436/ownvscodeextension/tree/0.0.1)

* *Initial release*

---

by Philipp B.
