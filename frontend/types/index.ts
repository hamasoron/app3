export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface Profile {
  id: number;
  user: User;
  username: string;
  display_name: string;
  bio: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | '';
  location: string;
  avatar: string | null;
  interests: string;
  interests_list: string[];
  created_at: string;
  updated_at: string;
}

export interface ProfileList {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  age: number | null;
  gender: string;
  location: string;
  avatar: string | null;
  bio: string;
}

export interface Like {
  id: number;
  from_user: number;
  to_user: number;
  from_user_profile: ProfileList;
  to_user_profile: ProfileList;
  is_mutual: boolean;
  created_at: string;
}

export interface Match {
  id: number;
  user1: number;
  user2: number;
  user1_profile: ProfileList;
  user2_profile: ProfileList;
  created_at: string;
}

export interface Message {
  id: number;
  match: number;
  sender: number;
  sender_username: string;
  sender_display_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}


