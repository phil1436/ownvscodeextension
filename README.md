<img src="https://github.com/phil1436/ownvscodeextension/raw/master/resources/logo.png" width="25%"/>

# OwnVscodeExtension

Providing tools for [Microsoft's Visual Studio Code](https://code.visualstudio.com/).

---

* [Features](#features)
  * [Move Selection](#move-selection)
  * [Translate Text](#translate-text)
  * [Working with Snapshots](#working-with-snapshots)
* [Installation](#installation)
* [Commands](#commands)
  * [Own Vscode Move](#own-vscode-move)
  * [Own VScode Language](#own-vscode-language)
  * [Own VScode Snapshot](#own-vscode-snapshot)
* [Configuration](#configuration)
* [Bugs](#bugs)
* [Release Notes](#release-notes)

---

## Features

### Move Selection

Move the selected text to a direction.

> Keyboard Shortcut: `Alt + LeftArrow/RightArrow` *(Mac: `Options + LeftArrow/RightArrow`)*

### Translate Text

Translates the selected text to a specified language.
> Tip: Just put the cursor inside a word to translate to select the word.

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

* If the extension did not got installed, run the command `Developer: Install Extension from Location...` and choose the extension folder.

---

## Commands

### Own Vscode Move

* `Move Selection To Left`: Moves selected text to the left. (`Alt+LeftArrow`)
* `Move Selection To Right`: Moves selected text to the right. (`Alt+RightArrow`)

### Own VScode Language

* `Translate Selection`: Translates selected text.
* `Check Spelling`: Check the selected text for spelling and suggest other words in case of wrong spelling (**only works for en-US!**).

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

### Move

* `Move Between Lines`: If enabled move a word from the beginning of a line to the end of the line above or from the end of a line to the beginning of the line below (Default: *disabled*).

### Translate

* `Default Translate`: Default translate configuration for [Own Vscode Translate: Translate Selection](https://github.com/phil1436/OwnVscodeExtension#own-vscode-translate). Value is a array of objects:

````json
[
  {"from":"en","to":"de"},
  {"from":"en","to":"es"} ...
]
````

Edit via: *Edit in settings.json*.

---

## Bugs

* Snapshots are deleted when installing a new version. Store the [snapshots file](snapshots.json) to an other location an restore it after installing. 

---

## [Release Notes](https://github.com/phil1436/ownvscodeextension/blob/master/CHANGELOG.md)
<!-- 
### [v0.0.5](https://github.com/phil1436/ownvscodeextension/tree/0.0.5)

*  -->

### [v0.0.4](https://github.com/phil1436/ownvscodeextension/tree/0.0.4)

* Command added
* Category renamed
* Commands extended

### [v0.0.3](https://github.com/phil1436/ownvscodeextension/tree/0.0.3)

* `Translate Selection` expanded

### [v0.0.2](https://github.com/phil1436/ownvscodeextension/tree/0.0.2)

* Bug fixes
* Insert Configurations
* Command Categories added
* Commands added

### [v0.0.1](https://github.com/phil1436/ownvscodeextension/tree/0.0.1)

* *Initial release*

---

by Philipp B.
