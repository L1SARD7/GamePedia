import { NextFunction, Request, Response } from "express"
import { userInfo } from "os"
import { jwtService } from "../application/jwtService"




export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        return next()
    }

    if (!req.cookies.accessToken) {
        return res.redirect('/login')
    }

    const userInfo = await jwtService.getUserInfoByToken(req.cookies.accessToken)
    if (userInfo) {
        //@ts-ignore
        req.user = userInfo
        return next() 
    }
    res.clearCookie('accessToken')
    res.redirect('/login')
    

}