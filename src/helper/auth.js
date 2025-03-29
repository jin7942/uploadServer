export function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.UPLOAD_API_KEY) {
        return res.status(403).json({ message: 'Invalid or missing API key' });
    }
    next();
}
