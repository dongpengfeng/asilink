import * as qs from 'qs'
import Storage from '@service/storage'

const extension = require('extensionizer')

export default class NotificationManager {

  /**
   * A collection of methods for controlling the showing and hiding of the notification popup.
   * @typedef {Object} NotificationManager
   */

  /**
   * Either brings an existing MetaMask notification window into focus, or creates a new notification window. New
   * notification windows are given a 'popup' type.
   */
  showPopup(route, query, width, height) {

    this._getPopup(async (err, popup) => {
      if (err) throw err
      // Bring focus to chrome popup
      if (popup) {
        // Bring focus to existing chrome popup
        extension.windows.remove(popup.id, console.error)
      }
      let params = '?'
      switch (route) {
        case 'author-contract-send':
          await Storage.set('authorContractSendData', query.data);
          break;
        case 'author-signature':
          await Storage.set('authorSignatureSendData', query.data);
          break;
        default:

          if (typeof query == 'object' && query.data) {
            params += qs.stringify(query.data)
            if (query.id) {
              params += '&id=' + query.id
            }
          } else if (typeof query == 'object') {
            params += qs.stringify(query)
          }
          break;
      }

      const cb = (currentPopup) => {
        this._popupId = currentPopup.id
      }
      // Create new notification popups
      let url_ = 'pages/popup.html#/' + route + params
      const creation = extension.windows.create({
        url: url_,
        type: 'popup',
        width,
        height
      }, cb)
      creation && creation.then && creation.then(cb)
    })
  }

  /**
   * Closes a MetaMask notification if it window exists.
   */
  closePopup() {
    // Closes notification popup
    this._getPopup((err, popup) => {
      if (err) throw err
      if (!popup) return
      extension.windows.remove(popup.id, console.error)
    })
  }

  /**
   * Checks all open MetaMask windows, and returns the first one it finds that is a notification window (i.e. has the
   * type 'popup')
   * @private
   * @param {Function} cb A node style callback that to whcih the found notification window will be passed.
   */
  _getPopup(cb) {
    this._getWindows((err, windows) => {
      if (err) throw err
      cb(null, this._getPopupIn(windows))
    })
  }

  /**
   * Returns all open MetaMask windows.
   * @private
   * @param {Function} cb A node style callback that to which the windows will be passed.
   */
  _getWindows(cb) {
    // Ignore in test environment
    if (!extension.windows) {
      return cb()
    }

    extension.windows.getAll({}, (windows) => {
      cb(null, windows)
    })
  }

  /**
   * Given an array of windows, returns the 'popup' that has been opened by MetaMask, or null if no such window exists.
   * @private
   * @param {array} windows An array of objects containing data about the open MetaMask extension windows.
   */
  _getPopupIn(windows) {
    return windows ? windows.find((win) => {
      // Returns notification popup
      return (win && win.type === 'popup' && win.id === this._popupId)
    }) : null
  }
}
