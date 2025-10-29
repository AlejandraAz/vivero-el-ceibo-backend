import NodeCache from "node-cache";
const { defaultMaxListeners } = NodeCache;

 const sendResponse = (res, statusCode, message, data = null) => {
    const isSuccess = statusCode < 400;

    return res.status(statusCode).json({
        status: isSuccess ? "success" : "error",
        message,
        ...(data && { data }),
    });
};
export default sendResponse;