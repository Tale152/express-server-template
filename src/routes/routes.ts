import { Express, Request, Response } from "express"

export default function bindRoutes(server: Express): void{

    server.get('/', (req: Request, res: Response) => {
        console.log(req.body)
        res.send('Express + TypeScript Server')
    })

}
