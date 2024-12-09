// firebaseUtils.ts
//@ts-ignore
import app from "../firebase/firebase.js";
import { getDatabase, ref, set, push } from "firebase/database";

// Function to upload data to Firebase
export const uploadToFirebase = async (path: string, data: { [key: string]: any }) => {
  try {
    const db = getDatabase(app);
    const newDocRef = push(ref(db, path)); // Generate a unique reference
    await set(newDocRef, data); // Save the data
    return { success: true, message: "Data saved successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message }; // Handle errors
  }
};
