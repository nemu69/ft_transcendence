import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Friend");
    }

    async getHtml() {
        return `
            <h1>Friend</h1>
            <p>Manage your privacy and configuration.</p>
        `;
    }
}