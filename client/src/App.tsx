import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import OrderList from "./components/order/OrderList";
import ProductList from "./components/product/ProductList";

function App() {
  return (
    <Router>
      <div className="text-gray-800">
        <Switch>
          <Route path="/" exact component={OrderList} />
          <Route path="/products" component={ProductList} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
