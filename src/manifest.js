var version = require('./version')
module.exports = {
    "name": "Asim Link",
    "version": version,
    "description": "Asim Link",
    "author": "FanLian",
    "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoRWLsbUn28emFixzYbcWMVLX0/H7qpOMrn3W/OD8/gVW+intLYMjpEksQLdffFfywRhZd+GJYfgB2wMoj0U7Z4fs30bRF9Khrp+s0I7svEJ6rUlf5F8Mot4LJt+tw08wstJJ5AQiWYJrvNfqcmJGuqdYQ1Izv19SKxkiotNbfJr0qFN9GkS3SW6tyHPRzLHIWz6HR60vACGD0yDOQFjONnCXaW4TF2JJjoIc6yqFV8zFQoTQTPTEyB3lDbO4tikAxqsF7GblE91lQWwlLA/BCv+IXEqZCnAxR7GyGfVMLasnPun4HkdDU/KMkCq8igFQ+sg4yD+siGp/uzkEkD9X5wIDAQAB",
    "manifest_version": 2,
    "icons": {
        "16": "images/plugin-icon/16.png",
        "48": "images/plugin-icon/48.png",
        "128": "images/plugin-icon/128.png"
    },
    "permissions": [
        "https://dev2.asimov.work/",
        "https://dev1.asimov.work/",
        "https://test-rpc.cir.network/",
        "activeTab",
        "tabs",
        "cookies",
        "background",
        "contextMenus",
        "storage",
        "notifications",
        "identity",
        "identity.email",
        "declarativeContent"
    ],

    background: {
        scripts: [
            "js/background.js"
        ],

        "persistent": false
    },
    options_page: "pages/options.html",
    browser_action: {
        default_title: 'Welcome in Asim Link',
        default_popup: 'pages/popup.html',
        default_icon: {
            "16": "images/plugin-icon/16.png",
            "48": "images/plugin-icon/48.png",
            "128": "images/plugin-icon/128.png"
        }
    },
    "content_scripts": [{
        "js": [
            "js/content.js"
        ],
        "run_at": "document_end",
        "matches": [
            "<all_urls>"
        ],
        "all_frames": true
    }],
    "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'; default-src 'self';connect-src * data: blob: filesystem:;style-src 'self' https://fonts.googleapis.com data: chrome-extension-resource: 'unsafe-inline';img-src 'self' data: chrome-extension-resource:;frame-src 'self' data: chrome-extension-resource:;font-src https://fonts.gstatic.com 'self' data: chrome-extension-resource:;media-src * data: blob: filesystem:;",
    "externally_connectable": {
        "matches": [
            "*://127.0.0.1/*",
            "*://localhost/*",
            "*://ide.asimov.work/*",
            "*://app.flow.cm/*"
        ],
        "ids": [
            "*"
        ]
    }
}
