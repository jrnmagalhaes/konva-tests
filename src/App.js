import './App.css';
import { FlowDrawerPage, FormDrawerPage } from './components/pages';
import { Header } from './components/atoms';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Header/>
      <Switch>
        <Route exact path='/'>
          <FlowDrawerPage/>
        </Route>
        <Route exat path='/form'>
          <FormDrawerPage/>
        </Route>
      </Switch>
    </Router>
  );
}


export default App;
