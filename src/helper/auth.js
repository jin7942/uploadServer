export function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const UPLOAD_API_KEY = 'SEXY_GUY_USED_MARKET';
    if (!apiKey || apiKey !== UPLOAD_API_KEY) {
        return res.status(403).json({ message: 'Invalid or missing API key' });
    }
    next();
}
