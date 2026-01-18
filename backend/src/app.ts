import compression from "compression"
import express, { NextFunction, Request, Response } from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"

export const app = express()

var whitelist = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
var corsOptions = {
    origin: function (origin: any, callback: (err: Error | null, origin?: any) => void) {
        //* Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)
        if (whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-platform'],
    exposedHeaders: ['set-cookie']
}

app.use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors(corsOptions))
    .use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, }))
    .use(compression({}))

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    next();
});

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500
    const message = error.message || "Server Error."
    const errorCode = error.code || "Error_Code"

    res.status(status).json({
        message: message,
        error: errorCode
    })
})