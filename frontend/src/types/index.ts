export interface User {
    _id: string,
    fname: string,
    lname: string,
    email: string,
    username: string,
    bio?: string,
    githubUsername?: string,
    friends: string[],
    projects: (string | Project)[],
    sessions: string[],
}

export interface Project {
    _id: string,
    name: string,
    description: string,
    githubLink: string,
    liveLink: string,
    lastUpdatedBy: string,
    fileTree: Object,
    isPrivate: boolean,
    owner: string
}

export interface FileTreeNode {
    name: string,
    id: string,
    children: FileTreeNode[] | null,
}

export interface SessionState {
    _id: string;
    participants: string[];
    project: Project | null;
    socketUser: string;
    trigger: string;
    language: string;
    sessionFileTree: Object;
    currFile: FileTreeNode;
}