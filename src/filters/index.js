import Vue from 'vue'
import { getTimeInSection } from "@utils"
import { sts2btc as sts2btcUtil } from "@/utils";

function sts2btc(num, indivisibleAsset = false) {
  return sts2btcUtil(num, indivisibleAsset);
}
Vue.filter('sts2btc', sts2btc)

function addrOmit(str, start = 3, end = 3) {
  const startStr = str.slice(0, start);
  const endStr = str.slice(str.length - end);
  return startStr + "···" + endStr;
}
Vue.filter('addrOmit', addrOmit)

function timeFilter(stamp) {
  return getTimeInSection(stamp);
}
Vue.filter('time', timeFilter);