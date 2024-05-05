import { useContext, createContext, useState } from "react";
const ApiContext = createContext();

const ApiProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("userLoggedIn") || false
  );
  const logoutHandle = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("username");
    setLoggedIn(false);
  };
  const loginHandle = () => {
    localStorage.setItem("userLoggedIn", true);
    setLoggedIn(true);
  };

  return (
    <ApiContext.Provider value={{ loggedIn, loginHandle, logoutHandle }}>
      {children}
    </ApiContext.Provider>
  );
};
export const useAuth = () => {
  return useContext(ApiContext);
};

export { ApiProvider, ApiContext };
