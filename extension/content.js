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
    const unpaidOrdersId = Object.keys(localStorage).find((k) =>
      /openerp_pos_db.+unpaid_orders/.test(k)
    );
    const orders = localStorage.getItem(unpaidOrdersId);
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
      orderSubmitBtn.addEventListener("click", (e) => {
        sendOrder(getCurrOrder());
      });
      window.clearInterval(intervalId);
    }
  }, 500);
})();
