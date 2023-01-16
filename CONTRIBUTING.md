# Development
To contribute, anyone can make Pull Requests. Considering this is a hobby project, they may or may not be merged, and merges may take a while depending on my available schedule.
To start contributing, reading the Obsidian plugin *getting started* entry on the [obsidian forum](https://forum.obsidian.md/t/how-to-get-started-with-developing-a-custom-plugin/8157/3) may help.
For documentation on watchers for ActivityWatch, the [ActivityWatch watcher documentation](https://docs.activitywatch.net/en/latest/examples/writing-watchers.html) might help. Just keep in mind Obsidian does not allow post requests using axios or fetch due to CORS policy. There is an official JS client for ActivityWatch at https://github.com/ActivityWatch/aw-client-js, but it does not work due to using axios instead of the unrestricted request of the Obsidian API. Any requests to ActivityWatch API being made need to be rewritten to use the Obsidian request API.

## Requirements
Any change made must satisfy the requirements of [Obsidian's plugin review](https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md). Changes should also be as unobtrusive to previously collected userdata as possible to not break existing installations. Further, contributions must satisfy GitHub TOS, which includes anyone only contributing code they have permission to use, either by writing themselves, by license or explicitly.
I ask to not trigger the version bump tool in npm as that is the last step that happens before a release is made.

## Building
During testing of development, `npm run dev` will continuously check for files being changed and run the build task. If you clone this repository directly into the plugins folder of an obsidian vault, simply reloading obsidian or disabling and reneabling the plugin in the community plugins tab will load the newly compiled version after changes have been made.
During development, it is advisable to start your ActivityWatch server using `aw-server --testing` or `aw-server --testing --verbose` and switching to development server in the plugin settings inside obsidian. That way the plugin will not access your ActivityWatch production server.
To build a version for production, `npm run build` has to be triggered. However, this is only relevant if installing patched versions manually without a proper release as well as making sure the plugin actually builds.
