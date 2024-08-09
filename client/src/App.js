import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from "./Context/PrivateRoute";
import {AuthProvider} from "./Context/AuthContext";

import HomePages from "./Pages/HomePages";
import Dashboard from "./Pages/Dashboard/Dashboard";

function App() {
  return (
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePages />} />
            <Route path="/boiteAMessage" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
            <Route path="/boiteAMessage/:conversationId" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
          </Routes>
        </AuthProvider>
      </Router>
  );
}

export default App;
