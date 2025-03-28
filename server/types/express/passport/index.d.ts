
declare global {
  namespace Express {
    interface User {
      id: string;
      is_vendor: boolean;
    }
  }
}

export {};