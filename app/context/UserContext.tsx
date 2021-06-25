import React from "react";
import { JwtDataShape } from "pluto-headers";
import { Jwt } from "jsonwebtoken";

interface UserContext {
  profile?: JwtDataShape;
  updateProfile: (newValue?: JwtDataShape) => void;
}

const UserContext = React.createContext<UserContext>({
  profile: undefined,
  updateProfile: (newValue) => {},
});

export const UserContextProvider = UserContext.Provider;
export default UserContext;
