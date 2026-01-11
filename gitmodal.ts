import { App, Modal, Setting, TextAreaComponent } from 'obsidian';
import { OutputModal } from 'outputmodal';
import { exec } from 'child_process';

export class GitModal extends Modal {
    private static repository_ = 'http://github.com/fwar34/Obsidian';
    private commitMsg_ = 'update obsidian';
    private onSubmit_: (commitMsg: string) => void;

    constructor(app: App, onSubmit: (commitMsg: string) => void) {
        super(app);
        this.onSubmit_ = onSubmit;
    }

    onOpen(): Promise<void> | void {
        const { contentEl } = this;

        this.contentEl.addClass('git-modal-container');

        contentEl.createEl('h1', { text: 'Insert commit message', cls: 'git-modal-title' })

        new TextAreaComponent(contentEl).setPlaceholder('Input commit message').onChange((value: string) => {
            this.commitMsg_ = value;
            console.log('New message:' + value);
        }).inputEl.addClass('commit-text-area');

        new Setting(contentEl).addButton((btn) =>
            btn
                .setButtonText('Commit')
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit_(this.commitMsg_);
                })
        ).settingEl.addClass('commit-button');
    }

    public async handleCommitAndPush(): Promise<void> {
        const outputmodal = new OutputModal(this.app);
        outputmodal.open();

        try {
            await this.executeGitCommand('git add .', outputmodal);
            await this.executeGitCommand(`git commit -m "${this.commitMsg_}"`, outputmodal);
            await this.executeGitCommand('git push origin master', outputmodal);

            outputmodal.addOutputLine('\n✅ All operations completed successfully!');
        } catch (error) {
            outputmodal.addOutputLine(`\n❌ Error: ${error.message}`);
        }
    }

    private async executeGitCommand(command: string, outputModal: OutputModal): Promise<void> {
        return new Promise((resolve, reject) => {
            outputModal.addOutputLine(`\n> ${command}\n`);

            const child = exec(command,
                {
                    cwd: this.app.vault.adapter.basePath,
                    encoding: 'utf-8'
                }, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });

            child.stdout?.on('data', (data) => {
                // const output = Buffer.isBuffer(data) ? data.toString('utf-8') : data
                const output = data.toString('utf-8')
                outputModal.addOutputLine(output);
            });

            child.stderr?.on('data', (data) => {
                // const output = Buffer.isBuffer(data) ? data.toString('utf-8') : data
                const output = data.toString('utf-8')
                outputModal.addOutputLine(output);
            })
        })
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}