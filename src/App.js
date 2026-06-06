import './App.css';
import { Routes, Route } from 'react-router-dom';
import {Home} from './views/Home';
import {Thankyou} from './views/Thankyou';
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/thankyou" element={<Thankyou />} />
      </Routes>
      </div>
  );
}

export default App;
