// draft

(function content() {
  const getOrderData = (order) => {
    return {
      uid: order.data.uid,
      floor: order.data.floor,
      table: order.data.table,
      multiprint_resume: order.data.multiprint_resume,
    }
  }
  const sendCurrOrder = () => {
    const orderSelected = document.querySelector('.order-button.select-order.selected');
    const orderId = orderSelected.getAttribute('data-uid');
    const unpaidOrdersId = Object.keys(localStorage).find(k => /openerp_pos_db.+unpaid_orders/.test(k))
    // optimize ? parser
    const orders = JSON.parse(localStorage.getItem(unpaidOrdersId));
    const order = orders.find(odr => odr.id === orderId);
    console.log(getOrderData(order));
  }
  const intervalId = window.setInterval(() => {
    const orderSubmitBtn = document.querySelector('.control-button.order-submit');
    if (orderSubmitBtn) {
      orderSubmitBtn.addEventListener('click', (e) => {
        // set time out ? so that we wait for local storage to get updated
        sendCurrOrder();
      })
      window.clearInterval(intervalId);
    }
  }, 500);

})();
