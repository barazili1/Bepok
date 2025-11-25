
export const fetchCrashOdd = async (): Promise<number | null> => {
  try {
    const response = await fetch("https://korsan27-b72ac-default-rtdb.firebaseio.com/pre/hipr.json");
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    // Assuming the data is a number or a string representation of a number
    const odd = Number(data);
    return isNaN(odd) ? null : odd;
  } catch (error) {
    console.error("Error fetching crash odd from Firebase:", error);
    return null;
  }
};

export const fetchNotifications = async (): Promise<Record<string, any> | null> => {
  try {
    const response = await fetch("https://korsan27-b72ac-default-rtdb.firebaseio.com/note.json");
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error fetching notifications from Firebase:", error);
    return null;
  }
};
