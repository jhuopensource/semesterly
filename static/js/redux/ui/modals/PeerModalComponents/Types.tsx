export interface User {
  email: string;
  first_name: string;
  last_name: string;
  img_url: string;
  username: string;
  userId: string;
  major: string;
  class_year: string;
}

export interface FriendRequest {
  friendRequestId: number;
  userId: number;
  email: string;
  sender: User;
  receiver: User;
  img_url?: string | null;
}
