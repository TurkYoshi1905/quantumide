declare global {
  interface Window {
    puter?: {
      auth: {
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        isSignedIn: () => boolean;
        getUser: () => Promise<{ username: string }>;
      };
      fs: {
        write: (path: string, content: string) => Promise<void>;
        read: (path: string) => Promise<string>;
        readdir: (path: string) => Promise<unknown[]>;
        mkdir: (path: string) => Promise<void>;
        delete: (path: string) => Promise<void>;
      };
      ai: {
        chat: (prompt: string) => Promise<string>;
      };
    };
  }
}

export {};
