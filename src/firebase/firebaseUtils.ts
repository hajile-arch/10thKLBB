//@ts-ignore
import app from "../firebase/firebase.js";
import { getDatabase, ref, set, push, get, remove, update } from "firebase/database";

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

// Function to get data from Firebase
export const getDataFromFirebase = async (path: string) => {
  try {
    const db = getDatabase(app);
    const dataRef = ref(db, path); // Reference to the path in the database
    const snapshot = await get(dataRef); // Fetch data from the path
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() }; // Return data if it exists
    } else {
      return { success: false, message: "No data available at this path" }; // If no data found
    }
  } catch (error: any) {
    return { success: false, message: error.message }; // Handle errors
  }
};

// Function to update an existing user
export const updateDataInFirebase = async (
  userId: string,
  data: { [key: string]: any }
) => {
  try {
    const db = getDatabase(app);
    const userRef = ref(db, `users/${userId}`);
    console.log(`Updating Firebase at: users/${userId}`); // Log the path

    await update(userRef, data);

    return { success: true, message: "User updated successfully!" };
  } catch (error: any) {
    console.error('Firebase update error:', error);  // Log the error for debugging
    return { success: false, message: error.message };
  }
};


// Function to delete data from Firebase
export const deleteDataFromFirebase = async (path: string) => {
  try {
    const db = getDatabase(app);
    const dataRef = ref(db, path); // Reference to the path in the database
    await remove(dataRef); // Delete data from the specified path
    return { success: true, message: "Data deleted successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message }; // Handle errors
  }
};
