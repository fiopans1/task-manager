import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "../auth/LoginPage";
import RegisterPage from "../auth/RegisterPage";
import { Button } from "react-bootstrap";

const HomePage = ({ login }) => {
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => navigate("/login")}>Login</Button>
      <Button onClick={() => navigate("/register")}>Register</Button>
    </div>
  );
};

export default HomePage;
