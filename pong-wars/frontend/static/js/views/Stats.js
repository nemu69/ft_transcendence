import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Stats");
    }

    async getHtml() {
        return `
            <h1>Stats</h1>
            <p>Manage your privacy and configuration.</p>
        `;
    }
}