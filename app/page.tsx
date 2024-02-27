"use client";

import React, { ChangeEventHandler, useState } from "react";

type User = {
  id: number;
  login: string;
  followers: number;
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    fetchUsers(event.target.value);
  };

  const fetchUsers = (query: string) => {
    setTimeout(async () => {
      try {
        const token = "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";
        setIsLoading(true);
        const response = await fetch(
          `https://api.github.com/search/users?q=${query}`,
          {
            headers: {
              Authorization: `token ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const users = data.items;
        const usersWithFollowers = await Promise.all(
          users.map((user: User) => fetchUserWithFollowers(user.login, token))
        );
        setSearchResults(
          usersWithFollowers.sort((a, b) => a.followers - b.followers)
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching GitHub users:", error);
      }
    }, 2000);
  };

  const fetchUserWithFollowers = async (username: string, token: string) => {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const user = await response.json();
      return { ...user, followers: user.followers };
    } catch (error) {
      console.error(`Error fetching user '${username}':`, error);
      return null;
    }
  };

  console.log(searchResults);

  return (
    <div className="container mx-auto p-4">
      <input
        type="text"
        placeholder="Search GitHub users..."
        value={searchQuery}
        onChange={handleChange}
        className="border border-gray-300 rounded px-4 py-2 mb-4"
      />
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">Username</th>
            <th className="px-4 py-2">Followers</th>
          </tr>
        </thead>
        {isLoading ? (
          <tbody>
            <tr>
              <td colSpan={2} className="text-center">
                Loading...
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {searchResults.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{user.login}</td>
                <td className="border px-4 py-2">{user.followers}</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
};

export default Home;
