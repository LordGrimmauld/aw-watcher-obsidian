# ActivityWatch and Obsidian compatibility
[ActivityWatch](https://activitywatch.net/) is an open source time tracker capable of keeping track how much time is spent using which program. To get detailed info, ActivityWatch allows adding *Watchers* capable of sending relevant information to the ActivityWatch API.

## How do I use it?
aw-watcher-obsidian is an ActivityWatch watcher watching the user activity in Obsidian vaults with the plugin active. The watcher currently tracks the name of the vault as well as the name of the currently active markdown file. The timeline and activity view in the evaluation screen of ActivityWatch will then be capable of telling the user how much time they spent on which file.
To install, either get it from Obsidians community plugins list \[as of writing this, the plugin is not yet approved though\] or place the main.js and package.json files in a folder under `vaultName/.obsidian/plugins/aw-watcher-obsidian`

## Where is my data going?
The data being collected by this plugin is sent to the ActivityWatch server running on localhost, which means the data does not leave your local machine at first. ActivityWatch does allow sharing data over multiple devices, but this Plugin does not do that by itself.

## Credits
To build the watcher API used in this project I tightly followed the official API at https://github.com/ActivityWatch/aw-client-js.
