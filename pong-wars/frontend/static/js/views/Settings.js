import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Setting");
    }

    async getHtml() {
        return `
            <h1>Setting</h1>
            <p>Manage your privacy and configuration.</p>
        `;
    }
}