<template>
  <fw-wallet-base class="import-wallet">
    <fw-nav>
      <template slot="center">
        <el-radio-group
          text-color="#fff"
          fill="#646464"
          v-model="importType"
          style="margin-bottom: 30px;"
        >
          <el-radio-button label="mnemonic">{{$t('use_mn')}}</el-radio-button>
          <el-radio-button label="privkey">{{$t('use_pk')}}</el-radio-button>
        </el-radio-group>
      </template>
    </fw-nav>
    <div v-show="importType == 'mnemonic'">
      <p class="desc">{{$t('mn_enter_tips')}}</p>
      <textarea class="mnemo-textarea" v-model="mnemoArray"></textarea>
    </div>
    <div v-show="importType == 'privkey'">
      <p class="desc">{{$t('privte_key_enter')}}</p>
      <textarea
        class="mnemo-textarea private-key-textarea"
        v-model="privateKey"
        :placeholder="$t('privte_key_enter')"
      ></textarea>
    </div>
    <p class="desc mrgn-v24">{{$t('password_set')}}</p>
    <p class="sub-title">{{$t('common_password')}}</p>
    <el-input type="password" v-model="password" :placeholder="$t('password_limit')"></el-input>
    <p class="sub-title">{{$t('common_confirm_ps')}}</p>
    <el-input type="password" v-model="repassword" :placeholder="$t('common_confirm_ps')"></el-input>
    <fw-button
      class="next-btn primary-active-btn"
      width="216"
      color="blue"
      @click.native="doneHandle"
    >{{$t('Common_next')}}</fw-button>
  </fw-wallet-base>
</template>
<script>
import WalletBase from "../back-template";
import Wallet from "@classes/Wallet";
import Wallets from "@service/wallets";
import { validateMnemonic } from "@utils";
import { Message } from "element-ui";
import Storage from "@service/storage";
import { CONSTANT } from "@/constant";
import { getWalletName } from "@utils";

export default {
  data() {
    return {
      importType: "mnemonic",
      password: "",
      repassword: "",
      mnemoArray: "",
      privateKey: ""
    };
  },
  components: {
    "fw-wallet-base": WalletBase
  },
  methods: {
    async doneHandle() {
      if (!this.checkPassword()) {
        return;
      }

      this.$store.dispatch("clearAllInfo");

      let allWalletInfo = (await Storage.get("walletInfo")) || {};
      allWalletInfo = Object.values(allWalletInfo);
      const walletName = getWalletName(allWalletInfo);

      let wallet = new Wallet();
      let parmas = {
        type: this.importType,
        walletName
      };
      if (this.importType == "mnemonic") {
        if (!this.checkMnonemic()) {
          this.errorMsg(this.$t("toast_incorrect_mnemonic"));
          return;
        }
        Object.assign(parmas, {
          mnemonic: this.mnemoArray.trim().toLowerCase(),
          pwd: this.password
        });
      } else {
        if (!this.checkPrivateKey()) {
          this.errorMsg(this.$t("private_key_error"));
          return;
        }
        Object.assign(parmas, {
          privateKey: this.privateKey.replace("0x", ""),
          pwd: this.password
        });
      }
      await wallet.import(parmas);
      await Storage.set("walletLogStatus", false);
      this.$router.replace("/");

      const allAddrs = await Storage.get("walletAddrs");
      const activeId = Wallets.getActiveWltId();
      const { address } = allAddrs[activeId][0][0];

      chrome.runtime.sendMessage({
        type: "HAD_FLOWMASK_LOGIN_OUT",
        result: {
          success: true,
          address
        }
      });
    },
    checkMnonemic() {
      let mnemonic_text = this.mnemoArray.trim().toLowerCase();
      return validateMnemonic(mnemonic_text);
    },
    checkPrivateKey() {
      let privateKey = this.privateKey.replace("0x", "");
      return /^[a-fA-F0-9]{64}$/.test(privateKey);
    },
    errorMsg(msg) {
      Message({
        message: msg,
        type: "error",
        duration: 3000
      });
    },
    checkPassword() {
      if (!this.password) {
        this.errorMsg(this.$t("common_input_ps"));
        return;
      }
      let reg = CONSTANT.PASSWORD_REG;
      if (!reg.test(this.password)) {
        this.errorMsg(this.$t("password_limit"));
        return;
      }
      if (this.password != this.repassword) {
        this.errorMsg(this.$t("toast_ps_not_match"));
        return;
      }
      return true;
    }
  }
};
</script>
<style lang="scss">
@import "../@styles/index.scss";

.wallet-base.import-wallet {
  padding-top: 16px;
  padding-bottom: 16px;
  height: 580px;

  .context-box {
    .fw-item.nav-bar {
      .center {
        text-align: center;
      }
    }

    .desc {
      margin-top: 12px !important;
      margin-bottom: 12px !important;
    }

    .sub-title {
      margin-top: 12px;
    }
  }

  .el-radio-group {
    margin-bottom: 0px !important;

    .el-radio-button {
      .el-radio-button__inner {
        font-size: 12px !important;
        padding: 10px 18px !important;
      }
    }
  }

  textarea {
    width: 100%;
    background: #fbfbfb;
    border-color: #dcdfe6;
  }

  textarea:hover {
    border-color: #c0c4cc;
  }

  textarea::-webkit-input-placeholder {
    color: #c2c5cd !important;
    font-size: 12px;
  }

  .mnemo-textarea {
    height: 160px;
    resize: none;
    border: 1px solid #dcdfe6;
    outline: none;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    border-radius: 4px;
  }

  .mnemo-textarea:focus {
    border-color: #409eff;
  }

  .private-key-textarea {
    font-size: 12px;
    height: 96px !important;
    padding: 8px 12px !important;
  }
}
</style>