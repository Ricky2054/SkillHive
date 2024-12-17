import './App.css';
import Route from './features/Route';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="bg-zinc-50 w-screen h-screen flex flex-col justify-center items-center">
      <Route path="/">
        <Route path="/"><Login /></Route>
        {/* <Route path="/dashboard"><Dashboard /></Route> */}
      </Route>
    </div>
  );
}

export default App; 