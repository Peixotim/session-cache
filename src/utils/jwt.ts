export interface JwtPayload {
    sub: string
    email: string
}

export interface JwtClaims extends JwtPayload {
    iat: number
    exp: number
}