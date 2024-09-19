import React, { useState, useEffect } from "react";
import { List, CircularProgress, ListItem } from "@mui/material";
import {
  getFetchFriendsEndpointEndpoint,
  getRemoveFriendEndpoint,
} from "../../../constants/endpoints";
import { User } from "./Types";
import FriendItem from "./FriendItem";

const CurrentFriends = () => {
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFriends = async () => {
      const response = await fetch(getFetchFriendsEndpointEndpoint());
      const responseJson = await response.json();
      setFriends(responseJson);
      setLoading(false);
    };
    getFriends();
  }, []);

  const removeFriend = async (userId: string) => {
    await fetch(getRemoveFriendEndpoint(userId));
    setFriends((prevFriends) =>
      prevFriends.filter((friend) => friend.userId !== userId)
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ListItem sx={{ justifyContent: "center" }}>
          <CircularProgress />
        </ListItem>
      );
    }

    if (friends.length === 0) {
      return <ListItem sx={{ justifyContent: "center" }}>No friends</ListItem>;
    }

    return friends.map((friend) => (
      <FriendItem
        key={friend.userId}
        user={friend}
        primaryText={`${friend.first_name} ${friend.last_name}`}
        secondaryText={`${friend.major} ${friend.class_year}`}
        buttons={[
          {
            text: "Remove Friend",
            onClick: () => removeFriend(friend.userId),
          },
        ]}
      />
    ));
  };

  return (
    <List
      sx={{
        display: "flex",
        justifyContent: "center",
        maxHeight: "60%",
        overflowY: "auto",
      }}
    >
      {renderContent()}
    </List>
  );
};

export default CurrentFriends;
