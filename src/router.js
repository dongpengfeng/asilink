import Vue from 'vue'
import Router from 'vue-router'

import Home from '@views/home'
import CreateWallet from "./views/wallet/create"
import ImportWallet from "./views/wallet/import"
import Login from "./views/wallet/login"
import Setpassword from './views/wallet/set-password'
import ShowMnemon from './views/wallet/show-mnemonic'
import ConfirmMnemon from './views/wallet/confirm-mnemonic'

Vue.use(Router)

export const constantRouterMap = [{
    path: '/',
    name: 'home',
    component: Home
}, {
    path: "/manage-wallet",
    name: "manage-wallet",
    component: () => import("./views/ManageWallet")
}, {
    path: '/create-wallet',
    name: 'create-wallet',
    component: CreateWallet
}, {
    path: '/login',
    name: 'login',
    component: Login
}, {
    path: "/confirm-mnemonic",
    name: "confirm-mnemonic",
    component: ConfirmMnemon
}, {
    path: '/set-password',
    name: 'set-password',
    component: Setpassword
}, {
    path: '/show-mnemon',
    name: 'show-mnemon',
    component: ShowMnemon
}, {
    path: '/import-wallet',
    name: "import-wallet",
    component: ImportWallet
},
{
    path: '/setting',
    component: () => import('./views/setting/setting'),
    children: [{
        path: '/',
        redirect: 'wallets'
    },
    {
        path: 'wallets',
        component: () => import('./views/setting/fwWallets')
    },
    {
        path: 'general',
        component: () => import('./views/setting/fwGeneral')
    },
    {
        path: 'about',
        component: () => import('./views/setting/fwAbout')
    }
    ]
},
{
    path: '/author-address',
    name: "author-address",
    component: () => import('./views/AuthorAddress')
},
{
    path: '/author-contract-send',
    name: "author-contract-send",
    component: () => import('./views/AuthorContractSend')
},
{
    path: '/author-signature',
    name: "author-signature",
    component: () => import('./views/AuthorSignature')
}
]

export default new Router({
    mode: 'hash',
    routes: constantRouterMap
})