import Vue from 'vue'
import App from './app.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import '../styles/index.scss'
import * as components from '../components';
import router from '../router'
import store from '../store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import "../filters"
import Storage from "../service/storage"
import Wallet from '../classes/Wallet';
import VueI18n from 'vue-i18n'
import en from "@static/i18n/en.json"
import zh from "@static/i18n/zh.json"
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import Store from '../store';
import Wallets from "@service/wallets";
import AsyncComputed from 'vue-async-computed';

Vue.use(AsyncComputed);
Vue.use(VueI18n);

const messages = {
    en: {
        ...en,
        ...enLocale
    },
    zh: {
        ...zh,
        ...zhLocale
    }
}

window.to = function (promise) {
    if (!promise || !Promise.prototype.isPrototypeOf(promise)) {
        return new Promise((resolve, reject) => {
            reject(new Error("requires promises as the param"));
        }).catch((err) => {
            return [null, err];
        });
    }
    return promise.then(function () {
        return [...arguments, null];
    }).catch(err => {
        return [null, err];
    });
}

Storage.get('lang').then((lang) => {
    lang = lang || 'en';
    const i18n = new VueI18n({
        locale: lang,
        messages
    })

    for (let key in components) {
        let c = components[key];
        let name = c.name || 'fw-' + key.toLowerCase()
        Vue.component(name, c);
    }

    Vue.config.devtools = true
    Vue.config.productionTip = false
    Vue.use(ElementUI, {
        i18n: (key, value) => i18n.t(key, value)
    })

    NProgress.configure({
        showSpinner: false
    })

    router.beforeEach(async (to, from, next) => {
        if (from.name == null) {
            switch (to.name) {
                case 'create-wallet':
                case 'verify-password':
                case 'login':
                    next();
                    break;
                default:
                    let walletInfo = await Storage.get("walletInfo");
                    if (!walletInfo || ((typeof walletInfo == 'object') && JSON.stringify(walletInfo) == '{}')) {
                        next('/create-wallet');
                        return;
                    }
                    switch (to.name) {
                        case 'author-address':
                            next();
                            break;
                        default:
                            let activeWltId = await Storage.get("activeWltId");
                            let logStatus = await Storage.get("walletLogStatus");
                            let wltInfo = walletInfo[activeWltId];

                            let walletInst = new Wallet();
                            await walletInst.wake(wltInfo);
                            await Store.dispatch('initRate');
                            if (!walletInst.backupFlag) {
                                delete walletInfo[activeWltId];
                                const walletsOrder = await Storage.get("walletsOrder") || [];
                                let ckeck = false;
                                for (let i = 0; i < walletsOrder.length; i++) {
                                    if (walletsOrder[i] === activeWltId) {
                                        walletsOrder.splice(i, 1);
                                        await Storage.set("walletsOrder", walletsOrder);
                                        if (walletsOrder.length) {
                                            ckeck = true;
                                            Wallets.setActiveWltId(walletsOrder[0]);
                                            next('/');
                                        }
                                        break;
                                    }
                                }
                                if (!ckeck) {
                                    next('/create-wallet');
                                }
                                await Storage.set('walletInfo', walletInfo);
                                return;
                            }
                            if (logStatus) {
                                next('/login');
                                return;
                            }
                            next();
                    }
            }
        } else {
            next();
        }
    });
    new Vue({
        router,
        store,
        i18n,
        render: h => h(App)
    }).$mount('#root')
})
