import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/navigation/Navbar';
import Login from './components/login/login';
import Signup from './components/signup/signup';
import LandingPage from './pages/landing_page/LandingPage';
import Profile from './pages/profile/profile';
import AppSettings from './pages/settings/appSettings';
import EditProfile from './pages/profile/editprofile';
import MarketPlace from './pages/marketplace/marketPlace';
import ListingPage from './pages/listingPage/listingPage';
import Checkout from './pages/checkout/Checkout';
import TransferPage from './pages/transferPage/TransferPage';
import { useAuthContext } from './hooks/useAuthContext';
import { useMetaMaskContext } from './hooks/useMetaMaskContext';


function App() {
  const { user } = useAuthContext()
  const { account } = useMetaMaskContext();


  return (
    <div className="App">
      <BrowserRouter>
      <Navbar/>
      <Routes>
          <Route 
            path="/" 
            element={!user ? <Login/> : <Navigate to="/home" replace/>} 
          />
          <Route
            path="/home"
            element={user ? <LandingPage /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/" replace/>}
          />
          <Route
            path="/profile/edit"
            element={user ? <EditProfile/> : <Navigate to="/" replace/>}
          />
          <Route
            path="/settings"
            element={user ? <AppSettings/> : <Navigate to="/" replace/>}
          />
          <Route
            path="/marketplace"
            element={user && account ? <MarketPlace/> : <Navigate to="/" replace/>}
          />
          <Route
            path="/listingpage"
            element={user && account ? <ListingPage/> : <Navigate to="/" replace/>}
          />
          <Route
            path="/checkout"
            element={user && account ? <Checkout/> : <Navigate to="/" replace/>}
          />
          <Route
            path="/transferpage"
            element={user && account ? <TransferPage/> : <Navigate to="/" replace/>}
          />
          <Route
            path="/signup"
            element={!user ? <Signup/> : <Navigate to="/home" replace/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
