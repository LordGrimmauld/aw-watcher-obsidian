import {App, Plugin, PluginSettingTab, request, RequestUrlParam, Setting} from 'obsidian';
import * as os from "os";


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

		await this.create_bucket(this.bucket_id, "app.editor.activity")
		this.statusBarItemEl.setText('ActivityWatch active');
	}

	async post(endpoint: string, data: object) {
		await request(new AWrequest(this.endpoint_url + endpoint, JSON.stringify(data)))
	}

	async create_bucket(id: string, event_type: string) {
		const data = {
			"client": this.watcher_name,
			"hostname": this.hostname,
			"type": event_type,
		}
		await this.post(`buckets/${id}`, data)
	}

	async send_heartbeat_data(id: string, heartbeat_data: object, pulsetime: number) {
		const endpoint = `buckets/${id}/heartbeat?pulsetime=${pulsetime}`
		const t = new Date().toISOString().slice(0, -1)
		await this.post(endpoint, {"timestamp": t, "duration": 0, "data": heartbeat_data})
	}

	async onload() {
		this.statusBarItemEl = this.addStatusBarItem();
		await this.loadSettings();
		await this.init()

		this.addSettingTab(new SampleSettingTab(this.app, this));

		this.registerInterval(window.setInterval(() => {
			const file = this.app.workspace.getActiveFile();
			if (file != null) {
				this.send_heartbeat_data(this.bucket_id, {
					"file": file.basename,
					"project": this.app.vault.getName(),
					"language": "Markdown"
				}, this.sleeptime + 1)
			}
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

class SampleSettingTab extends PluginSettingTab {
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
