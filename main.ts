import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { join } from 'path';
import { InsertLinkModal } from 'modal';
import { GitModal } from 'gitmodal';


// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
	myBoolean: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	myBoolean: true
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	private autoGit() {
		const onSubmit = (commitMsg: string) => {
			console.log('auto-git submit process');
			gitModal.handleCommitAndPush();
		}
		const gitModal = new GitModal(this.app, onSubmit);
		gitModal.open();
	}

	async onload() {
		console.log('插件加载开始。。。。。。。');
		await this.loadSettings();
		console.log('加载后的设置：', this.settings);
		console.info('插件初始化完成');

		this.addCommand({
			id: 'test-for-feng',
			name: 'test-for-feng-name',
			editorCallback: (editor: Editor) => {
				const selectText = editor.getSelection();
				const onSubmit = (text: string, url: string) => {
					editor.replaceSelection(`[${text}](${url})`);
				};

				new InsertLinkModal(this.app, selectText, onSubmit).open();
			}
		})

		this.addCommand({
			id: 'auto-git',
			name: 'auto-git',
			hotkeys: [{modifiers: ['Mod', 'Alt'], key: 'g'}],
			callback: () => {
				this.autoGit();
			}
		})

		// 获取插件目录并打印
		const pluginName = this.manifest.name;
		const pluginRoot = this.app.vault.getRoot();
		console.log("插件名字：", join(pluginRoot.name, '/', pluginName));

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'auto-git', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			// new Notice('This is a notice!');
			this.autoGit();
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, _view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
