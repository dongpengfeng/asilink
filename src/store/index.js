import Vue from 'vue';
import Vuex from 'vuex';
import WalletState from './wltState'
import RateState from './rateState'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        wltState: WalletState,
        rateState: RateState
    }
});
