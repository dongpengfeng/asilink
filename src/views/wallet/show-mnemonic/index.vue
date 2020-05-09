<template>
  <fw-wallet-base>
    <fw-nav></fw-nav>
    <p class="title">{{$t('start_new_backup_wallet')}}</p>
    <p class="desc">{{$t('backup_wallet_men')}}</p>
    <div class="mnon-container">
      <span v-for="(mnon,i) in mnonArray" :key="i" class="mnon">{{mnon}}</span>
    </div>
    <fw-button
      class="next-btn primary-active-btn"
      width="216"
      color="blue"
      @click.native="nextHandle"
    >{{$t('common_wrote')}}</fw-button>
  </fw-wallet-base>
</template>

<script>
import WalletBase from "../back-template";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      mnonArray: []
    };
  },
  components: {
    "fw-wallet-base": WalletBase
  },
  methods: {
    nextHandle() {
      this.$router.push({
        name: "confirm-mnemonic",
        params: {
          mnonArray: this.mnonArray
        }
      });
    }
  },
  computed: {
    ...mapGetters(["getMnemonic"])
  },
  mounted() {
    if (this.mnonArray.length > 0) {
      return;
    }
    this.mnonArray = this.getMnemonic.split(" ");
  }
};
</script>

<style lang="scss" scoped>
.mnon-container {
  background: #646464;
  min-height: 160px;
  border-radius: 4px;
  padding: 24px;
  .mnon {
    font-size: 16px;
    font-weight: 500;
    color: #fff;
    text-align: center;
    display: inline-block;
    margin: 16px 0;
    display: inline-block;
    width: 25%;
  }
}
</style>
