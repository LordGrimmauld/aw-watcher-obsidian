# ActivityWatch and Obsidian compatibility
ActivityWatch (https://activitywatch.net/) is an open source time tracker capable of keeping track how much time is spent using which program. To get detailed info, ActivityWatch allows adding *Watchers* capable of sending relevant information to the ActivityWatch API.

## How do I use it?
aw-watcher-obsidian is an ActivityWatch watcher watching the user activity in Obsidian vaults with the plugin active. The watcher currently tracks the name of the vault as well as the name of the currently active markdown file. The timeline and activity view in the evaluation screen of ActivityWatch will then be capable of telling the user how much time they spent on which file.

## Where is my data going?
The data being collected by this plugin is sent to the ActivityWatch server running on localhost, which means the data does not leave your local machine at first. ActivityWatch does allow sharing data over multiple devices, but this Plugin does not do that by itself.

## Development
To contribute, anyone can make Pull Requests. Considering this is a hobby project, they may or may not be merged, and merges may take a while depending on my available schedule.
To start contributing, reading the Obsidian plugin *getting started* entry on the obsidian forum (https://forum.obsidian.md/t/how-to-get-started-with-developing-a-custom-plugin/8157/3) may help.
For documentation on watchers for ActivityWatch, the documentation entry at https://docs.activitywatch.net/en/latest/examples/writing-watchers.html might help. Just keep in mind Obsidian does not allow post requests using axios or fetch due to CORS policy. There is an official JS client for ActivityWatch at https://github.com/ActivityWatch/aw-client-js, but it does not work due to using axios instead of the unrestricted request of the Obsidian API. Any requests to ActivityWatch API being made need to be rewritten to use the Obsidian request API.

## Credits
To build the watcher API used in this project I tightly followed the official API at https://github.com/ActivityWatch/aw-client-js.
