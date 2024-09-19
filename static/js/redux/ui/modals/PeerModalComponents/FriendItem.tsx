import React from "react";
import { ListItem, ListItemText, Button, Grid, Avatar } from "@mui/material";
import { User } from "./Types";

interface ButtonConfig {
  text: string;
  onClick: () => void;
}

interface FriendItemProps {
  user: User;
  primaryText: string;
  secondaryText: string;
  buttons: ButtonConfig[];
}

const FriendItem: React.FC<FriendItemProps> = ({
  user,
  primaryText,
  secondaryText,
  buttons,
}) => (
  <ListItem>
    <Grid container spacing={2} justifyContent="center">
      <Grid item>
        <Avatar
          src={user.img_url}
          alt={`${user.first_name} ${user.last_name}`}
          sx={{ width: 40, height: 40 }}
        />
      </Grid>
      <Grid item width="40%">
        <ListItemText
          primary={primaryText}
          primaryTypographyProps={{
            fontSize: "1.4rem",
            fontWeight: "bold",
          }}
          sx={{ display: "flex", alignItems: "center" }}
        />
        <ListItemText
          primary={secondaryText}
          sx={{ display: "flex", alignItems: "center" }}
        />
      </Grid>
      {buttons.map((button, index) => (
        <Grid item key={button.text}>
          <Button variant="contained" color="secondary" onClick={button.onClick}>
            {button.text}
          </Button>
        </Grid>
      ))}
    </Grid>
  </ListItem>
);

export default FriendItem;
