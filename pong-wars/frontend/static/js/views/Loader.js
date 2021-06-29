import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Loading...");
    }

    async getHtml() {
        return `
        <link rel="stylesheet" href="/static/css/loader.css">
        <div class="container">
        <div class="paddle" id="left"></div>
        <div class="paddle" id="right"></div>
        <div class="ball"></div>
        <div class="loading">Loading...</div>
      </div>
        `;
    }
}