# Yas Drive - A Private File Storage and Download System

## 📌 Project Overview
Yas Drive is a **private cloud storage application** where users can securely upload, store, and download their files. The application ensures that **only the user who uploaded a file can download it** using Supabase storage and MongoDB for file metadata.

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Token)
- **Storage:** Supabase (Private Bucket)
- **Frontend:** EJS, Tailwind CSS
- **Middleware:** Multer for file uploads
- **Security:** Bcrypt for password hashing

---

## 📂 Project Stages
### **1️⃣ Setting Up the Project**
1. **Initialize Node.js**
   ```sh
   npm init -y
   ```
2. **Install Dependencies**
   ```sh
   npm install express mongoose dotenv multer jsonwebtoken bcryptjs ejs
   ```
3. **Set Up Environment Variables (`.env`)**
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

### **2️⃣ Creating User Authentication System**
- **User Model (`models/user.model.js`)**
- **Register & Login Routes (`routes/auth.routes.js`)**
- **JWT-based Authentication Middleware (`middleware/auth.js`)**

### **3️⃣ Implementing File Upload System**
- **File Model (`models/file.model.js`)**
  ```javascript
  const mongoose = require("mongoose");

  const fileSchema = new mongoose.Schema({
    filePath: { type: String, required: true },
    originalname: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  });

  module.exports = mongoose.model("File", fileSchema);
  ```
- **Multer Configuration for File Upload (`routes/index.routes.js`)**

### **4️⃣ Uploading Files to Supabase Storage**
1. **Configure Supabase in `config/supabase.js`**
2. **Modify Upload Route to Store Metadata in MongoDB**
   ```javascript
   router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
     const fileBuffer = req.file.buffer;
     const filePath = `uploads/${req.user.userId}/${Date.now()}_${req.file.originalname}`;

     const { data, error } = await supabase.storage.from("drive").upload(filePath, fileBuffer);
     if (error) throw error;

     await fileModel.create({ filePath, originalname: req.file.originalname, user: req.user.userId });
     res.redirect("/home");
   });
   ```

### **5️⃣ Restricting File Download to Uploader Only**
1. **Modify the Download Route (`routes/index.routes.js`)**
   ```javascript
   router.get("/download/:id", authMiddleware, async (req, res) => {
     const file = await fileModel.findById(req.params.id);
     if (!file || file.user.toString() !== req.user.userId) {
       return res.status(403).json({ message: "Unauthorized" });
     }

     const { data, error } = await supabase.storage.from("drive").createSignedUrl(file.filePath, 60 * 60);
     if (error) throw error;
     res.redirect(data.signedUrl);
   });
   ```

### **6️⃣ Frontend: Rendering File List & Download Links (EJS)**
```html
<div class="files mt-3 flex flex-col gap-2">
  <% files.forEach((file) => { %>
  <div class="p-2 cursor-pointer rounded-md bg-gray-300 flex justify-between">
    <h1><%= file.originalname %></h1>
    <a href="/download/<%= file._id %>" class="text-blue-500 hover:text-blue-700">
      <i class="ri-download-line"></i>
    </a>
  </div>
  <% }) %>
</div>
```

### **7️⃣ Running the Project**
```sh
npm start
```
Open `http://localhost:3000` in the browser.

---

## 🚀 Features
✅ Secure User Authentication  
✅ Private File Uploads  
✅ Only Uploader Can Download  
✅ Signed URLs for Secure Access  
✅ Responsive UI with EJS & Tailwind CSS

---

## 📌 Future Improvements
- Implement file preview before download.
- Add email verification for user authentication.
- Improve UI with React.js.


---

## 📜 License
This project is open-source and free to use.

---

Let me know if you want to add anything! 🚀🔥

