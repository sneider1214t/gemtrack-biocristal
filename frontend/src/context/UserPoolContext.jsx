import { createContext, useContext, useState } from "react";

const defaultUsers = [
  { username: "sneider", password: "1020111", role: "admin" },
  { username: "santa", password: "1214", role: "worker" },
];

const UserPoolContext = createContext();

export function UserPoolProvider({ children }) {
  const [extraUsers, setExtraUsers] = useState([]);

  const addUser = (user) => {
    setExtraUsers((prev) => [...prev, user]);
  };

  const users = [...defaultUsers, ...extraUsers];

  return (
    <UserPoolContext.Provider value={{ users, addUser }}>
      {children}
    </UserPoolContext.Provider>
  );
}

export const useUserPool = () => useContext(UserPoolContext);
