import {UserResponseDTO} from "../../users/DTOs/user-response.dto";

export interface RegisterResponseDTO {
    status: "success";
    message: string;
    user: UserResponseDTO;
}

export interface LoginResponseDTO {
    status: "success";
    message: string;
    token_type: "Bearer";
    access_token: string;
}
