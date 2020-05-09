<template>
  <div class="about-container">
    <img src="/images/icons/logo_m@2x.png" class="logo" />
    <p class="version">{{$t('common_version')}}&nbsp;{{version}}</p>
    <div class="btn-group">
      <p class="btn active-btn" @click="modalHandle('PC')">{{$t('me_about_policy')}}</p>
      <p class="btn active-btn" @click="modalHandle('UA')">{{$t('user_agreement')}}</p>
    </div>
    <ul class="item">
      <li v-for="(item,index) in items" :key="index">
        <span>{{$t(item.title)}}</span>&nbsp;
        <a @click="handleNewPage(item.link)">{{item.link}}</a>
      </li>
    </ul>

    <ModalPrivacyPolicy
      :visible="PCModal"
      @close="()=>{modalHandle('PC')}"
    ></ModalPrivacyPolicy>

    <ModalUserAgreement
      :visible="UAModal"
      @close="()=>{modalHandle('UA')}"
    ></ModalUserAgreement>
  </div>
</template>

<script>
import version from "@/version";
import ModalUserAgreement from "@components/ModalUserAgreement";
import ModalPrivacyPolicy from "@components/ModalPrivacyPolicy";

export default {
  name: "about",
  components: {
    ModalUserAgreement,
    ModalPrivacyPolicy
  },
  data() {
    return {
      UAModal: false,
      PCModal: false,
      items: [
        {
          title: "official_website",
          link: "https://www.asimov.network/wallet"
        },
        {
          title: "development_guide",
          link: "https://doc.asimov.network/"
        },
        { title: "support_dapp", link: "https://www.asimov.network/Dapp" }
      ]
    };
  },
  computed: {
    version() {
      return version || 1;
    }
  },
  methods: {
    handleNewPage(link) {
      chrome.tabs.create({ url: link });
    },
    modalHandle(whichModal) {
      this[whichModal + "Modal"] = !this[whichModal + "Modal"];
    }
  }
};
</script>

<style lang="scss" >
.about-container {
  padding: 48px 64px;
  background: white;
  width: 528px;
  border: 1px solid #ededed;
  border-radius: 4px;
  text-align: center;
  font-size: 0;
  .logo {
    width: 149px;
    height: 40px;
  }
  .version {
    font-size: 12px;
    color: #9d9d9d;
    margin: 8px 0 24px;
  }
  .btn-group {
    display: flex;
    justify-content: space-between;
    .btn {
      cursor: pointer;
      width: 188px;
      border: 1px solid #d3d3d3;
      border-radius: 4px;
      padding: 12px 24px;
      color: #646464;
      font-size: 12px;
      font-weight: 500;
    }
  }
  .item {
    border-top: 1px solid #ededed;
    padding: 16.5px 0 0;
    margin: 24px 0 0;
    width: 100%;
    text-align: left;
    div {
      font-size: 14px;
      margin-bottom: 12px;
    }
    li {
      font-size: 14px;
      list-style-type: none;
      position: relative;
      line-height: 20px;
      padding-left: 16px;
      margin-top: 8px;
      &::before {
        content: "";
        display: block;
        width: 8px;
        height: 8px;
        border-radius: 100%;
        background: #d3d3d3;
        position: absolute;
        top: 6px;
        left: 0;
        margin-bottom: 8px;
      }
      span {
        color: #282828;
      }
      a {
        color: #0076ff;
      }
      a:hover {
        border-bottom: 1px solid #0076ff;
      }
    }
  }
}
</style>
