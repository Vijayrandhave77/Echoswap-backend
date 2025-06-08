const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const sharp = require("sharp");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.cloud_api_key,
  api_secret: process.env.cloud_api_secret,
});

// Multer setup (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload with compression
const uploadToCloudinary = async (fileBuffer, originalname) => {
  const originalName = path.parse(originalname).name;
  const modifiedFilename = `custom-${Date.now()}-${originalName}`;

  // Compress the image using sharp
  const compressedBuffer = await sharp(fileBuffer)
    .resize({ width: 1024 }) // Resize if needed
    .jpeg({ quality: 70 }) // Compress
    .toBuffer();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "uploads",
        resource_type: "image",
        public_id: modifiedFilename,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(compressedBuffer);
  });
};

// Main file upload handler
const fileUploads = async (req) => {
  // Handle single file
  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname
    );
    return result; // object
  }

  // Handle multiple files
  if (req.files && Array.isArray(req.files)) {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, file.originalname)
    );

    const results = await Promise.allSettled(uploadPromises);
    const successfulUploads = results
      .filter((res) => res.status === "fulfilled")
      .map((res) => res.value);
    const failedUploads = results
      .filter((res) => res.status === "rejected")
      .map((res) => res.reason);

    if (failedUploads.length > 0) {
      console.warn("Some uploads failed:", failedUploads);
    }

    return successfulUploads;
  }

  return null;
};

module.exports = { upload, fileUploads };
