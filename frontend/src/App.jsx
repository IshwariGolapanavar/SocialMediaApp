import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreatePost from "./pages/CreatePost";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />

                <Route path="/signup" element={<Signup />} />

                <Route path="/login" element={<Login />} />

                <Route path="/home" element={<Home />} />

                <Route
                    path="/create-post"
                    element={<CreatePost />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;