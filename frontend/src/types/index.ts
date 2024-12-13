export interface User {
    fname: string;
    lname: string;
    email: string;
    username: string;
    bio?: string;
    githubUsername?: string;
    friends: string[];
    projects: string[];
    session?: string;
    isLoggedIn: boolean;
  }