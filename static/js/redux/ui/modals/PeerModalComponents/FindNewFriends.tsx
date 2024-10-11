import React, { useState, useEffect } from "react";
import { selectTheme } from "../../../state/slices/themeSlice";
import {
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Grid,
  Avatar,
} from "@mui/material";
import {
  getFriendRequestsSentEndpoint,
  getRejectFriendRequestEndpoint,
  getSearchFriendsEndpoint,
  getSendFriendRequestEndpoint,
} from "../../../constants/endpoints";
import Cookie from "js-cookie";
import { User } from "./Types";
import { useAppSelector } from "../../../hooks";

const FindNewFriends = () => {
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [requestSent, setRequestSent] = useState<{ [key: string]: boolean }>({});
  const theme = useAppSelector(selectTheme);
  const isDarkMode = theme && theme.name && theme.name === "dark";

  useEffect(() => {
    const fetchFriendRequestsSent = async () => {
      const response = await fetch(getFriendRequestsSentEndpoint());
      const responseJson = await response.json();
      setRequestSent(
        responseJson.reduce(
          (acc: string[], user: User) => ({ ...acc, [user.userId]: true }),
          {}
        )
      );
    };
    fetchFriendRequestsSent();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsSearching(true);
      const response = await fetch(getSearchFriendsEndpoint(searchTerm));
      const responseJson = await response.json();
      setSearchResults(responseJson);
      setIsSearching(false);
    };
    const delayDebounceFn = setTimeout(fetchSearchResults, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSendOrWithdrawRequest = async (userId: string) => {
    const endpoint = requestSent[userId]
      ? getRejectFriendRequestEndpoint(userId)
      : getSendFriendRequestEndpoint(userId);
    const res = await fetch(endpoint, {
      headers: {
        "X-CSRFToken": Cookie.get("csrftoken"),
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      credentials: "include",
    });
    const json = await res.json();
    if (res.status === 200) {
      setRequestSent((prevStatus) => ({
        ...prevStatus,
        [userId]: !prevStatus[userId],
      }));
    }
  };
  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center">
      <Box width="100%" maxWidth={600} display="flex" justifyContent="center">
        <TextField
          label="Search Users"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
          margin="normal"
          fullWidth
          // darkmode pallete for fonts and border
          {...(isDarkMode && {
            InputLabelProps: { style: { color: "white" } },
            sx: {
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "darkgrey",
                },
                "&:hover fieldset": {
                  borderColor: "darkgrey",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "darkgrey",
                },
              },
            },
          })}
        />
      </Box>
      {isSearching && searchTerm.length > 0 && <CircularProgress />}
      {!isSearching && searchTerm && searchResults.length > 0 && (
        <List
          sx={{ width: "100%", maxWidth: 600, maxHeight: "60%", overflowY: "auto" }}
        >
          {searchResults.map((user) => (
            <ListItem key={user.username}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    src={user.img_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    sx={{ width: 40, height: 40 }}
                  />
                </Grid>
                <Grid item xs>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                    primaryTypographyProps={{
                      fontSize: "1.4rem",
                      fontWeight: "bold",
                    }}
                    sx={{ display: "flex", alignItems: "center" }}
                  />
                  <ListItemText
                    primary={`${user.major} ${user.class_year}`}
                    sx={{ display: "flex", alignItems: "center" }}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color={requestSent[user.userId] ? "primary" : "secondary"}
                    onClick={() => handleSendOrWithdrawRequest(user.userId)}
                    sx={{ height: "100%" }}
                  >
                    {requestSent[user.userId] ? "Withdraw Request" : "Send Request"}
                  </Button>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      )}
      {!isSearching && searchTerm && !searchResults.length && (
        <Typography align="center" sx={{ mt: 2 }}>
          No users found
        </Typography>
      )}
    </Box>
  );
};

export default FindNewFriends;
