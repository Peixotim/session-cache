import {NextFunction, Request, Response} from "express";
import {UserService} from "../service/user.service";
import {UserResponseDTO} from "../DTOs/user-response.dto";

export class UserController {
    private service = new UserService();

   public async findByEmail(req : Request, res: Response , next:NextFunction){
       try{
            const email : string | string[] = req.params.email
            const user : UserResponseDTO = await this.service.findByEmail(email as string)
            return res.status(200).json(user)
       }catch(error){
            next(error)
       }
   }
}
