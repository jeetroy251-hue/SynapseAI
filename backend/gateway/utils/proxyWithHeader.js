import proxy from "express-http-proxy"

export const proxyWithHeader = (serviceUrl) => { 
    return proxy(serviceUrl, {
        limit: "50mb", // Overrides the default 1mb limit in raw-body
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