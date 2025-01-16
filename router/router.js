const express = require('express');
const router = express.Router();
const cors = require('cors');
const connectDb = require('../db/config');
const musicModel = require('../model/File');
const mm = require('music-metadata');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS configuration
router.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Create a unique filename while preserving the original extension
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${timestamp}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP3 files are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Connect to database
connectDb();

router.post('/uploadsong', upload.single('mp3file'), async (req, res) => {
    try {
        res.header("Access-Control-Allow-Credentials", "true");
        
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        console.log('File received:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path
        });

        if (!fs.existsSync(req.file.path)) {
            throw new Error('File was not saved correctly');
        }

        let metadata;
        try {
            metadata = await mm.parseFile(req.file.path);
        } catch (parseError) {
            console.error('Metadata parsing error:', parseError);
            
            // Save basic file info if metadata parsing fails
            const musicSchema = new musicModel({
                audioName: req.file.filename,
                audioFileName: req.file.originalname,
                audioPath: req.file.path
            });

            await musicSchema.save();

            return res.json({
                title: req.file.originalname,
                artist: 'Unknown Artist',
                filename: req.file.filename,  // Important: Send the saved filename
                picture: null
            });
        }

        // Extract metadata
        const { title, artist, picture } = metadata.common;

        // Save to database
        const musicSchema = new musicModel({
            audioName: req.file.filename,
            audioFileName: req.file.originalname,
            audioPath: req.file.path
        });

        await musicSchema.save();

        // Send response with the saved filename
        res.json({
            title: title || req.file.originalname,
            artist: artist || 'Unknown Artist',
            filename: req.file.filename,  // Important: Send the saved filename
            picture: picture && picture[0] ? picture[0].data.toString('base64') : null
        });

    } catch (error) {
        console.error('Server error:', error);
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).json({
            error: error.message || 'Internal server error during upload'
        });
    }
});

// Get items endpoint
router.get('/getItem', async (req, res) => {
    try {
        const items = await musicModel.find();
        res.json(items);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            error: 'Failed to fetch music items'
        });
    }
});

module.exports = router;