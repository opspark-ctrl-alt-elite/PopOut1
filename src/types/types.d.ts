import { User as UserModel } from "../../server/models/User"; // Import your actual User model type

declare global {
  namespace Express {
    interface User extends InstanceType<typeof User> {
      // This now includes all User model properties
    }
    
    interface Request {
      user?: User;  // Make sure user is properly typed in requests
    }
  }
}