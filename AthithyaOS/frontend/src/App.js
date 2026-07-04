import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import BootSequence from "@/components/BootSequence";
import Login from "@/components/Login";
import OSShell from "@/components/OSShell";
import "@/App.css";
function Gate() {
  const { user } = useAuth();
  const [booted, setBooted] = useState(false);
  if (!booted) return <BootSequence onDone={() => setBooted(true)} />;
  if (user === undefined) return <BootSequence onDone={() => {}} steady />;
  if (!user) return <Login />;
  return <OSShell />;
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <Gate />
          <Toaster position="top-right" richColors closeButton />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
