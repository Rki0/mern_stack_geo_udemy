import React from "react";
import UsersList from "../components/UsersList";

function Users() {
  const USERS = [
    {
      id: "u1",
      name: "Rki0",
      image:
        "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy-inverted.svg",
      places: 3,
    },
  ];

  return <UsersList items={USERS} />;
}

export default Users;
