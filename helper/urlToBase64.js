export default async function urlToBase64(url) {
  try {
    // Fetch the content of the URL
    const response = await fetch(url, {
      mode: "cors",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
        "sec-fetch-dest": "image",
      },
    });
    console.log("response fetcjh", response);
    // Convert the response to a Blob
    const blob = await response.blob();

    // Read the Blob as a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      // reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    return null;
  }
}
