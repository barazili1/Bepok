
import { AccessKey } from '../types';

const DB_URL = "https://korsan27-b72ac-default-rtdb.firebaseio.com/keys.json";

export const verifyAccessKey = async (inputKey: string): Promise<{ valid: boolean; data?: AccessKey; error?: string }> => {
  try {
    const response = await fetch(DB_URL);
    if (!response.ok) {
      throw new Error("Network error connecting to verification server.");
    }

    const data = await response.json();
    
    if (!data) {
        return { valid: false, error: "Database empty or inaccessible." };
    }

    // Iterate through keys in the database object to find a match
    // The structure is keys: { "pushId": { ...data } }
    const match = Object.values(data).find((entry: any) => entry.key === inputKey) as AccessKey | undefined;

    if (!match) {
        return { valid: false, error: "Invalid Access Key." };
    }

    if (!match.isActive) {
        return { valid: false, error: "Key has been disabled." };
    }

    return { valid: true, data: match };

  } catch (error) {
    console.error("Auth Error:", error);
    return { valid: false, error: "Connection failed. Please check internet." };
  }
};
