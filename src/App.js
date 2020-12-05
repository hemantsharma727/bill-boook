import React from 'react';
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom';
import InvoicesList from './components/InvoicesList';
import Invoice from './components/Sales';

const renderNestedComponent = (match, history, nestedComponent) =>
  nestedComponent.map(({ ComponentClass, props }, index) => (
    <ComponentClass key={index} {...props} match={match} history={history} />
  ));

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="app">
          <div className="flex j-c-space-between">
            <div className="brand-name">
              <h1 className="center fs-30 mt-30">Bill Book</h1>
            </div>
            <div className="nav flex a-i-center">
              {/* <NavLink to="/" exact activeClassName="active">Home</NavLink> */}
              <NavLink to="/sales/invoice" exact activeClassName="active">
                Sales
              </NavLink>
              <NavLink to="/purchase/invoice" activeClassName="active">
                Purchase
              </NavLink>
              <NavLink to="/invoices/list" activeClassName="active">
                Invoices List
              </NavLink>
            </div>
          </div>
          <Switch>
            {/* <Route
              exact
              path="/"
              children={({ match, history }) => renderNestedComponent(match, history, children['/'])}
            /> */}
            <Route
              exact
              path="/sales/invoice"
              children={({ match, history }) => (
                <Invoice match={match} history={history} key={window.location.pathname} />
              )}
            />
            <Route
              exact
              path="/sales/invoice/:id"
              render={({ match, history }) => (
                <Invoice match={match} history={history} key={window.location.pathname} />
              )}
            />
            <Route
              exact
              path="/invoices/list"
              render={({ match, history, props }) => (
                <InvoicesList match={match} history={history} {...props} key={window.location.pathname} />
              )}
            />

            {/* <Route path="/" exact Component={() => <h1>Home</h1>} />
            <Route path={'/sales/invoice'} Component={<Invoice />} />
            <Route path={'/sales/invoice/:id'} Component={<Invoice />} />
            <Route path={'/invoices/list'} Component={InvoicesList} /> */}
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
