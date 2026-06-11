const { google } = require("googleapis");
const { Readable } = require("stream");

/**
 * Google Drive upload helper
 * Uses service account credentials from environment variables
 */

const getAuth = () => {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Google Drive credentials belum dikonfigurasi. Set GOOGLE_CLIENT_EMAIL dan GOOGLE_PRIVATE_KEY di .env");
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
};

/**
 * Upload file buffer to Google Drive
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - MIME type of the file
 * @param {string} [folderId] - Optional Google Drive folder ID
 * @returns {Promise<{fileId: string, previewUrl: string}>}
 */
const uploadToDrive = async (fileBuffer, fileName, mimeType, folderId) => {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const fileMetadata = {
    name: fileName,
  };
  if (folderId) {
    fileMetadata.parents = [folderId];
  }

  const media = {
    mimeType,
    body: Readable.from(fileBuffer),
  };

  // Upload file
  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id",
  });

  const fileId = response.data.id;

  // Make it viewable by anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId,
    previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
  };
};

/**
 * Delete a file from Google Drive
 * @param {string} fileId - The Google Drive file ID
 */
const deleteFromDrive = async (fileId) => {
  if (!fileId) return;
  try {
    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });
    await drive.files.delete({ fileId });
  } catch (err) {
    console.error("⚠️ Failed to delete from Drive:", err.message);
  }
};

module.exports = { uploadToDrive, deleteFromDrive };
