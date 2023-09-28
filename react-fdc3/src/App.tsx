import AccountHoldings from './AccountHoldings';
import AccountList from './AccountList';
import './App.css';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path={'/account-list'} element={<AccountList />} />
        <Route path={'/account-holdings'} element={<AccountHoldings />} />
      </Routes>
    </div>
  );
}

export default App;
