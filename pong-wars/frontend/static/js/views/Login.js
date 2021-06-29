import AbstractView from "./AbstractView.js";

export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.setTitle("Logout");
    }

    async getHtml() {
        return `
            <div class="wrapper">
            <div class="container-login">
                <h1 class="login">Login</h1>
                
                <form class="form">
                    <input type="text" placeholder="Username">
                    <input type="password" placeholder="Password">
                    <button type="submit" id="login-button" data-link>Login</button>
                    <button type="submit" id="register-button"data-link>Register</button>
        
                    </br></br>
                <input type="text" placeholder="Guest" data-link>
                </form>
            </div>
            
            <ul class="bg-bubbles">
                <li></li>
                <li class="circle"></li>
                <li></li>
                <li class="circle"></li>
                <li></li>
                <li class="circle"></li>
                <li class="circle"></l>
                <li></li>
                <li class="circle"></li>
            </ul>
        </div>
        `;
    }
}