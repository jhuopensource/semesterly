import React, { useState, useEffect } from "react";
import { List, ListItem, CircularProgress } from "@mui/material";
import {
  getAcceptFriendRequestEndpoint,
  getFriendRequestsReceivedEndpoint,
  getRejectFriendRequestEndpoint,
} from "../../../constants/endpoints";
import { FriendRequest, User } from "./Types";
import FriendItem from "./FriendItem";

const RequestsReceived = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendRequestsReceived = async () => {
      const response = await fetch(getFriendRequestsReceivedEndpoint());
      const responseJson = await response.json();
      setFriendRequests(responseJson);
      setLoading(false);
    };
    fetchFriendRequestsReceived();
  }, []);

  const handleFriendRequest = async (friendRequestId: number, action: string) => {
    const endpoint =
      action === "accept"
        ? getAcceptFriendRequestEndpoint(friendRequestId)
        : getRejectFriendRequestEndpoint(friendRequestId);
    await fetch(endpoint);
    setFriendRequests((currentFriendRequests) =>
      currentFriendRequests.filter((fr) => fr.friendRequestId !== friendRequestId)
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
      return (
        <ListItem style={{ justifyContent: "center" }}>No requests received</ListItem>
      );
    }

    return friendRequests.map((fr) => (
      <FriendItem
        key={fr.friendRequestId}
        user={fr.sender}
        primaryText={`${fr.sender.first_name} ${fr.sender.last_name}`}
        secondaryText={`${fr.sender.major} ${fr.sender.class_year}`}
        buttons={[
          {
            text: "Accept",
            onClick: () => handleFriendRequest(fr.friendRequestId, "accept"),
          },
          {
            text: "Ignore",
            onClick: () => handleFriendRequest(fr.friendRequestId, "reject"),
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

export default RequestsReceived;
