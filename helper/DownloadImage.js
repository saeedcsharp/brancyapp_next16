export async function DownloadImage(imageurl, name) {
  try {
    // Fetch the file as a blob to ensure it downloads instead of opening
    const response = await fetch(imageurl);
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create and trigger download link
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback to simple download method
    const link = document.createElement("a");
    link.href = imageurl;
    link.download = name;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
