// draft

(function content() {
  const getOrderData = (order) => {
    return {
      uid: order.data.uid,
      floor: order.data.floor,
      table: order.data.table,
      multiprint_resume: order.data.multiprint_resume,
    };
  };
  /*
    using web scraping we retrive
    the current order id from pos session
    along with the order list details from local storage
  */
  const getCurrOrder = () => {
    const orderSelected = document.querySelector(
      ".order-button.select-order.selected"
    );
    const orderId = orderSelected.getAttribute("data-uid");
    // filter most recent session key
    // sessionKey = f40b1cae-ee17-4689-b36c-e7e417af8
    const sessionKey = Object.keys(localStorage)
      .filter((k) => {
        return /openerp_pos_db_.+_pos_session_id/.test(k);
      })
      .map((objKey) => ({
        key: objKey,
        val: Number(localStorage[objKey]),
      }))
      .sort((a, b) => b.val - a.val)[0].key;
    const [, localStorageUUID] = /openerp_pos_db_(.+)_pos_session_id/.exec(
      sessionKey
    );
    const orders = localStorage.getItem(
      `openerp_pos_db_${localStorageUUID}_unpaid_orders`
    );
    return { orderId, orders };
  };

  // send order to background chrome extension
  const sendOrder = (orderObj) => {
    chrome.runtime.sendMessage({ package: orderObj });
  };

  const intervalId = window.setInterval(() => {
    const orderSubmitBtn = document.querySelector(
      ".control-button.order-submit"
    );
    if (orderSubmitBtn) {
      orderSubmitBtn.addEventListener("click", () => {
        sendOrder(getCurrOrder());
      });
      window.clearInterval(intervalId);
    }
  }, 500);
})();
