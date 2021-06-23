import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Logout");
    }

    async getHtml() {
        return `
            <h1>Logout</h1>
            <p>Manage your privacy and configuration.</p>
        `;
    }
}