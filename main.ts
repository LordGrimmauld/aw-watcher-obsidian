import {
	apiVersion,
	App,
	FileSystemAdapter,
	Plugin,
	PluginSettingTab,
	request,
	RequestUrlParam,
	Setting, TAbstractFile
} from 'obsidian';
import * as os from "os";

type Nullable<T> = T | null;

class AWrequest implements RequestUrlParam {
	body: string | ArrayBuffer;
	contentType = "application/json";
	headers: Record<string, string> = {"Content-type": "application/json", "charset": "utf-8"};
	method = "post";
	throw = true;
	url: string;

	constructor(url: string, body: string) {
		this.url = url;
		this.body = body;
	}
}

interface ActivityWatcherSettings {
	devServer: boolean;
}

const DEFAULT_SETTINGS: ActivityWatcherSettings = {
	devServer: false
}

export default class ActivityWatchPlugin extends Plugin {
	settings: ActivityWatcherSettings;
	hostname: string = os.hostname()
	endpoint_url: string
	watcher_name = "aw-watcher-obsidian"
	bucket_id: string
	sleeptime = 5  // loop cycle time
	statusBarItemEl: HTMLElement

	async init() {
		this.statusBarItemEl.setText('ActivityWatch initializing...');
		const port = this.settings.devServer ? 5666 : 5600
		this.bucket_id = `${this.watcher_name}_${this.hostname}`
		this.endpoint_url = `http://127.0.0.1:${port}/api/0/`

		if (this.settings.devServer) {
			console.log(`sleeptime is ${this.sleeptime}`)
			console.log(`watcher_name is ${this.watcher_name}`)
			console.log(`port is ${port}`)
			console.log(`bucket_id is ${this.bucket_id}`)
			console.log(`endpoint_url is ${this.endpoint_url}`)
		}

		await this.createBucket(this.bucket_id, "app.editor.activity")
		this.statusBarItemEl.setText('ActivityWatch active');
	}

	async post(endpoint: string, data: object) {
		await request(new AWrequest(this.endpoint_url + endpoint, JSON.stringify(data)))
	}

	async createBucket(id: string, event_type: string) {
		const data = {
			"client": this.watcher_name,
			"hostname": this.hostname,
			"type": event_type,
		}
		await this.post(`buckets/${id}`, data)
	}

	async sendHeartbeatData(id: string, heartbeat_data: object, pulsetime: number) {
		const endpoint = `buckets/${id}/heartbeat?pulsetime=${pulsetime}`
		const t = new Date().toISOString()
		await this.post(endpoint, {"timestamp": t, "duration": 0, "data": heartbeat_data})
	}

	async sendAbstractFileEvent(file: Nullable<TAbstractFile>, extraData: Nullable<object>, pulseTime: number) {
		if (file) {
			await this.sendHeartbeatData(this.bucket_id, {
				"file": "/" + file.path,
				"project": file.vault.getName(),
				"language": "Markdown", // todo: map file extension to language
				"projectPath": file.vault.adapter instanceof FileSystemAdapter ? file.vault.adapter.getBasePath() : "unknown vault path",
				"editor": "Obsidian",
				"editorVersion": apiVersion,
				...(extraData ? extraData : {})
			}, pulseTime)
		}
	}

	async sendFileHeartbeatEvent(file: Nullable<TAbstractFile>) {
		await this.sendAbstractFileEvent(file, {
			"eventType": "obsidian.activeFileHeartbeatEvent"
		}, this.sleeptime + 1)
	}

	async sendFileRenameEvent(file: Nullable<TAbstractFile>, oldPath: string) {
		await this.sendAbstractFileEvent(file, {
			"eventType": "obsidian.renameFileEvent",
			"oldPath": oldPath
		}, 0);
	}

	async sendFileDeleteEvent(oldPath: Nullable<TAbstractFile>) {
		await this.sendAbstractFileEvent(oldPath, {
			"eventType": "obsidian.deleteFileEvent",
		}, 0);
	}

	async sendFileCreateEvent(oldPath: Nullable<TAbstractFile>) {
		await this.sendAbstractFileEvent(oldPath, {
			"eventType": "obsidian.createFileEvent",
		}, 0);
	}

	async onload() {
		this.statusBarItemEl = this.addStatusBarItem();
		await this.loadSettings();
		await this.init()

		this.registerEvent(app.vault.on('rename', (file, oldPath) =>
			this.sendFileRenameEvent(file, oldPath)
		));

		this.registerEvent(app.vault.on('delete', oldFile =>
			this.sendFileDeleteEvent(oldFile)
		));

		this.registerEvent(app.vault.on('create', oldFile =>
			this.sendFileCreateEvent(oldFile)
		));

		this.addSettingTab(new ObsidianWatcherSettingTab(this.app, this));

		this.registerInterval(window.setInterval(() => {
			this.sendFileHeartbeatEvent(this.app.workspace.getActiveFile());
		}, this.sleeptime * 1000));
	}

	onunload() {
		this.statusBarItemEl.remove()
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ObsidianWatcherSettingTab extends PluginSettingTab {
	plugin: ActivityWatchPlugin;

	constructor(app: App, plugin: ActivityWatchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Settings for ActivityWatch plugin'});

		new Setting(containerEl)
			.setName('ActivityWatch development server')
			.setDesc('If enabled, uses development server for ActivityWatch instead of production. Default off.')
			.addToggle(t => t.setValue(this.plugin.settings.devServer)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.devServer = value;
					await this.plugin.saveSettings();
					await this.plugin.init()
				}))
	}
}
