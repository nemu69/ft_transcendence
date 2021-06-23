import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Profile");
    }

    async getHtml() {
        return `
            <h1>Profile</h1>
            <p>Manage your privacy and configuration.</p>
        `;
    }
}