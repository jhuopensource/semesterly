import React, { useState, useEffect } from "react";
import { List, ListItem, CircularProgress } from "@mui/material";
import {
  getFriendRequestsSentEndpoint,
  getRejectFriendRequestEndpoint,
} from "../../../constants/endpoints";
import { FriendRequest } from "./Types";
import FriendItem from "./FriendItem";

const RequestsSent = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendRequestsSent = async () => {
      const response = await fetch(getFriendRequestsSentEndpoint());
      const responseJson = await response.json();
      setFriendRequests(responseJson);
      setLoading(false);
    };
    fetchFriendRequestsSent();
  }, []);

  const withdrawFriendRequest = async (friendRequestId: number) => {
    await fetch(getRejectFriendRequestEndpoint(friendRequestId));
    setFriendRequests((currFriendRequests) =>
      currFriendRequests.filter((fr) => fr.friendRequestId !== friendRequestId)
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ListItem style={{ justifyContent: "center" }}>
          <CircularProgress />
        </ListItem>
      );
    }

    if (friendRequests.length === 0) {
      return <ListItem style={{ justifyContent: "center" }}>No requests sent</ListItem>;
    }

    return friendRequests.map((fr) => (
      <FriendItem
        key={fr.friendRequestId}
        user={fr.receiver}
        primaryText={`${fr.receiver.first_name} ${fr.receiver.last_name}`}
        secondaryText={`${fr.receiver.major} ${fr.receiver.class_year}`}
        buttons={[
          {
            text: "Withdraw",
            onClick: () => withdrawFriendRequest(fr.friendRequestId),
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

export default RequestsSent;
