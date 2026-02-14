// // utils/svgToJpgBase64.js
// import canvg from 'canvg';

// const svgToJpgBase64 = async (svgString) => {
//   try {
//     // Convert SVG string to a Buffer
//     const canvas = document.createElement('canvas');

//     // Use canvg to render the SVG onto the canvas
//     await canvg(canvas, svgString);

//     // Get the base64 representation of the canvas
//     const base64String = canvas.toDataURL('image/jpeg').split(',')[1];

//     return base64String;
//   } catch (error) {
//     console.error('Error converting SVG to JPG base64:', error);
//     throw error;
//   }
// };

// export default svgToJpgBase64;
// const canvg = require('canvg');

// const svgToJpgBase64 = async (svgString) => {
//   try {
//     const canvas = document.createElement('canvas');
//     await canvg(canvas, svgString);
//     const base64String = canvas.toDataURL('image/jpeg').split(',')[1];
//     return base64String;
//   } catch (error) {
//     console.error('Error converting SVG to JPG base64:', error);
//     throw error;
//   }
// };

// export default svgToJpgBase64;
// utils/svgToJpgBase64.js

const svgToJpgBase64 = async (svgString) => {
  try {
    // Create a new Image element
    const img = new Image();

    // Set the SVG string as the source
    img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;

    // Wait for the image to load
    await new Promise((resolve) => (img.onload = resolve));

    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    const context = canvas.getContext("2d");
    context.drawImage(img, 0, 0);

    // Get the base64 representation of the canvas
    const base64String = canvas.toDataURL("image/jpeg").split(",")[1];

    return base64String;
  } catch (error) {
    console.error("Error converting SVG to JPG base64:", error);
    throw error;
  }
};

export default svgToJpgBase64;
