import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl) => { 
    return proxy(serviceUrl, {
        limit: "50mb", // Overrides default limit
        proxyTimeoutMs: 180000, // 3 minutes timeout for proxy socket connection
        timeout: 180000,        // 3 minutes timeout for request handling
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            if (srcReq.user) {
              proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
            }
            if (srcReq.cookies?.session) {
                proxyReqOpts.headers["x-session-id"] = srcReq.cookies.session
            }
            return proxyReqOpts
        }
    })
}