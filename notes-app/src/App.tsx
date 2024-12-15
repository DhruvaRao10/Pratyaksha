import React from "react"
import { Routes, Route } from "react-router-dom"
import Home from "./components/Home"
import Login from "./components/Login";
import Register from "./components/Reg"
import Logout  from "./components/Logout";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout/>}/>
            </Routes>
        </>
    );
};


export default App 