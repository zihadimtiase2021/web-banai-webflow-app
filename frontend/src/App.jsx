
function App() {
  const login = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/webflow`;
  };

  return (
    <div className="App">
      <h1>Webflow Class Renamer</h1>
      <button onClick={login}>Login with Webflow</button>
    </div>
  );
}

export default App;