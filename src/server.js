import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { join, resolve, sep } from 'path';
import http from 'http';
import { v4 } from 'uuid';
import sharp from 'sharp';

import { mkdirs } from './helper/fileHelper.js';
import { authenticateApiKey } from './helper/auth.js';
import config from './_config.js';

// TODO: API 키 문제 해결
const app = express();
const __dirname = resolve();
const date = new Date();
app.use(cors());
app.use('/upload', express.static(join(__dirname, 'upload')));

// 폴더 경로 생성
const folderName = join('upload', String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate()));
const uploadPath = join(__dirname, folderName);
if (!fs.existsSync(uploadPath)) {
    mkdirs(uploadPath);
    console.log('create folder:', uploadPath);
}

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, v4() + file.originalname.slice(file.originalname.lastIndexOf('.'))),
});
const upload = multer({ storage });
const filefields = upload.fields([{ name: 'images', maxCount: config.FILE_MAX_COUNT }]);

// 이미지 업로드 (API KEY 인증 필요)
app.post('/api/uploadImg', authenticateApiKey, filefields, async (req, res) => {
    const result = { data: [] };
    const images = req.files?.images || [];

    for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (i === 0) {
            try {
                const resized = await sharp(file.path).resize({ width: 400, height: 400, fit: 'cover' }).withMetadata().toBuffer();
                await fs.promises.writeFile(file.path, resized);
            } catch (e) {
                console.error('Sharp error:', e);
            }
        }

        result.data.push({
            path: `${config.DOMAIN}/${folderName.replaceAll(sep, '/')}/`,
            originalname: file.originalname,
            uuidName: file.filename,
            ext: file.originalname.slice(file.originalname.lastIndexOf('.')),
            fileSize: file.size,
            sort: i,
        });
    }

    res.json(result);
});

// 이미지 삭제 (API KEY 인증 필요)
app.delete('/api/uploadImg', authenticateApiKey, async (req, res) => {
    const filePath = join(__dirname, 'upload', req.headers.filename || '');
    if (!fs.existsSync(filePath)) return res.status(404).send('not found');
    try {
        await fs.promises.unlink(filePath);
        console.log('deleted:', req.headers.filename);
        res.status(200).send('success');
    } catch (e) {
        res.status(500).send('error');
    }
});

// 서버 시작
http.createServer(app).listen(config.PORT, () => {
    console.log(` Server Ready at ${config.DOMAIN}`);
});
