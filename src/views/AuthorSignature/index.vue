<template>
  <div class="content__container">
    <div class="title">{{$t('verify_password')}}</div>
    <el-input class="input" type="password" :placeholder="$t('common_input_ps')" v-model="password"></el-input>
    <div class="footer-btns">
      <div class="btn btn-cancel active-btn" @click="handleClose">{{$t('common_cancel')}}</div>
      <div class="btn btn-save suc-active-btn" @click="handleConfirm">{{$t('common_confirm')}}</div>
    </div>
  </div>
</template>

<script>
import Storage from "@service/storage";
import Wallet from "@classes/Wallet";
import Wallets from "@service/wallets";
import { TranService } from "@service/transaction";
import { CONSTANT } from "@/constant";
import { signature, getWalletPubKey } from "@utils";
import Store from "@store";

export default {
  data() {
    return {
      wltInst: true,
      password: "",
      id: "",
      toSignMessage: String,
      type: "",
      txData: {}
    };
  },
  methods: {
    handleClose() {
      const type = this.type.replace(/(GET_)/, "POST_");
      chrome.runtime.sendMessage({
        type,
        id: this.id,
        result: {
          success: false,
          msg: "RejectSignature"
        }
      });
    },
    async handleConfirm() {
      if (!this.password) {
        this.$message({
          showClose: true,
          message: this.$t("common_input_ps"),
          type: "error"
        });
        return;
      }
      if (this.wltInst.validatePayPassword(this.password)) {
        let sendMsg = {};
        switch (this.type) {
          case "GET_Signature":
            const pk = this.wltInst.getAuthPrivateKey(
              this.password,
              CONSTANT.DEFAULT_COIN.coinType
            );
            const signatureStr = signature(pk, this.toSignMessage);
            const pubKey = await getWalletPubKey();

            sendMsg = {
              success: true,
              msg: "",
              data: {
                signature: signatureStr,
                pubKey
              }
            };
            break;
          case "GET_SignTransaction":
            const { inputs, outputs, gasLimit } = this.txData;
            let wltInst = Wallets.getActiveWallet();
            let keys = await wltInst.getPrivateKeys(
              CONSTANT.DEFAULT_COIN.coinType,
              inputs,
              this.password
            );

            if (keys && keys.length) {
              let txraw = await TranService.generateRawTx(
                inputs,
                outputs,
                keys,
                gasLimit
              );

              sendMsg = {
                success: true,
                msg: "",
                data: {
                  txraw
                }
              };
            } else {
              this.$message({
                showClose: true,
                message: "error",
                type: "error"
              });
              return;
            }
            break;
          default:
            break;
        }

        let type = this.type.replace(/(GET_)/, "POST_");
        chrome.runtime.sendMessage({
          type,
          id: this.id,
          result: sendMsg
        });
      } else {
        this.$message({
          showClose: true,
          message: this.$t("toast_incorrect_password"),
          type: "error"
        });
      }
    }
  },
  async created() {
    let dataObj = await Storage.get("authorSignatureSendData");
    dataObj = dataObj.data;
    let { data, id, type } = dataObj;
    this.id = id;
    this.type = type;

    switch (type) {
      case "GET_Signature":
        this.toSignMessage = data.toSignMessage;
        break;
      case "GET_SignTransaction":
        this.txData = data;
        break;
      default:
        break;
    }

    let activeWltId = await Storage.get("activeWltId");
    let walletInfo = await Storage.get("walletInfo");
    let wltInfo = walletInfo[activeWltId];
    this.wltInst = new Wallet();
    await this.wltInst.wake(wltInfo);

    window.addEventListener("unload", () => {
      chrome.runtime.sendMessage({
        type: "POST_CheckCloseEvent",
        result: {
          success: true
        },
        id: this.id
      });
    });
  }
};
</script>

<style>
html {
  width: 416px !important;
  height: 212px !important;
}
</style>

<style lang="scss" scoped>
.content__container {
  background: #fff;
  padding: 18px 32px;
  .title {
    font-size: 20px;
    color: #282828;
    font-weight: 500;
  }
  .input {
    margin-top: 12px;
  }

  .footer-btns {
    display: flex;
    justify-content: space-between;

    .btn {
      width: 168px;
      height: 48px;
      line-height: 48px;
      box-sizing: border-box;
      font-size: 16px;
      font-weight: 500;
      border-radius: 4px;
      text-align: center;
      margin-top: 48px;
      &:hover {
        cursor: pointer;
      }
    }
    .btn-cancel {
      color: #646464;
      border: 1px solid #c9c9c9;
    }
    .btn-save {
      background-color: #02ba3d;
      color: #fff;
    }
  }
}
</style>
