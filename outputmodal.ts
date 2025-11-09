import { App, Modal } from "obsidian";

export class OutputModal extends Modal {
    private outputContainer: HTMLElement;
    private isClosed = false;

    constructor(app: App) {
        super(app);
    }

    onOpen(): Promise<void> | void {
        const { contentEl } = this;
        contentEl.createEl('h1', { text: 'Git command output', cls: 'git-output-title' });
        this.outputContainer = contentEl.createEl('div', { cls: 'git-output-div' })
    }

    addOutputLine(line: string): void {
        if (this.isClosed || !this.outputContainer) {
            return;
        }

        this.outputContainer.createEl('div', { text: line });
        this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
    }

    onClose(): void {
        this.isClosed = true;
        const { contentEl } = this;
        contentEl.empty();
    }
}