import { getCurrencyRate2USD } from "@api/rate";

export default {
    state: {
        currencyRate: 0,
        coinRate: {
            'USDT': 1
        }
    },
    mutations: {
        setCurrencyRate(state, data) {
            state.currencyRate = data;
        },
        setCoinRate(state, data) {
            state.coinRate = data;
        }
    },
    actions: {
        async initRate({ dispatch }) {
            await dispatch('queryCurrencyRate');
        },
        async queryCurrencyRate({ commit }, currency) {
            let currencyRate = await getCurrencyRate2USD("CNY");
            commit('setCurrencyRate', currencyRate);
        }
    },
    getters: {}
}
