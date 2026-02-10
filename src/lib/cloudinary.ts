const CLOUD_NAME = "ddly4a7ig";
const UPLOAD_PRESET = "vitiligo-cure";

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error("فشل رفع الصورة");
  }

  const data = await res.json();
  return data.secure_url;
}
