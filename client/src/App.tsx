import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import OrdersList from './components/order/OrdersList';
import ProductsList from './components/product/ProductsList';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/" exact component={OrdersList} />
          <Route path="/products" component={ProductsList} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
