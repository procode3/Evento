import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { ParamsDictionary } from 'express-serve-static-core';


interface CustomRequest extends Request {
    io: any;
}

const testReqIo = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const io = req.io as any;
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
};
   
export { testReqIo };