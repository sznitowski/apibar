import multer from "multer";
import path from "path";
import fs from "fs";

const dir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const uid = (req as any).usuarioId || "anon";
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `avatar-${uid}-${Date.now()}${ext}`);
  }
});

export const upload = multer({ storage });
