import AbstractView from "./views/AbstractView.js";
import Dashboard from "./views/Dashboard.js";
import PostView from "./views/PostView.js";
import Logout from "./views/Logout.js";
import Match from "./views/Match.js";
import Profile from "./views/Profile.js";
import Stats from "./views/Stats.js";
import Settings from "./views/Settings.js";
import Friend from "./views/Friend.js";

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

// var x = document.getElementById("music").autoplay;

function nodeScriptReplace(node) {
    if ( nodeScriptIs(node) === true ) {
        node.parentNode.replaceChild( nodeScriptClone(node) , node );
    }
    else {
        var i = -1, children = node.childNodes;
        while ( ++i < children.length ) {
            nodeScriptReplace( children[i] );
        }
    }
    
    return node;
}
function nodeScriptClone(node){
    var script  = document.createElement("script");
    script.text = node.innerHTML;
    
    var i = -1, attrs = node.attributes, attr;
    while ( ++i < attrs.length ) {                                    
        script.setAttribute( (attr = attrs[i]).name, attr.value );
    }
    return script;
}

function nodeScriptIs(node) {
    return node.tagName === 'SCRIPT';
}

const getParams = match => {
    /*const values = match.result.slice(1);
    const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);
    
    return Object.fromEntries(keys.map((key, i) => {
        return [key, values[i]];
    }));*/
};

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const router = async () => {
    const routes = [
        { path: "/", view: Dashboard },
        { path: "/match", view: Match },
        { path: "/friend", view: Friend },
        { path: "/profile", view: Profile },
        { path: "/settings", view: Settings },
        { path: "/stats", view: Stats },
        { path: "/posts/:id", view: PostView },
        { path: "/logout", view: Logout }
    ];
    
    // Test each route for potential match
    const potentialMatches = routes.map(route => {
        return {
            route: route,
            result: location.pathname.match(pathToRegex(route.path))
        };
    });
    
    let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);
    
    if (!match) {
        match = {
            route: routes[0],
            result: [location.pathname]
        };
    }
    
    const view = new match.route.view(getParams(match));
    
    document.querySelector("#app").innerHTML = await view.getHtml();
    nodeScriptReplace(document.getElementsByTagName("body")[0]);
};

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]") && e.target.nodeName == "A") {
            e.preventDefault();
            navigateTo(e.target.href);
        }
        else if (e.target.parentElement.matches("[data-link]")) {
            e.preventDefault();
            navigateTo(e.target.parentElement.href);
        }
    });
    
    router();
});
