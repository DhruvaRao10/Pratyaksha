import jwt
from jwt import InvalidTokenError
from fastapi import FastAPI, Depends, HTTPException, status, Request
from models import TokenTable
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


ACCESS_TOKEN_EXPIRE = 90
REFRESH_TOKEN_EXPIRE = 60 * 24 * 7

ALGORITHM = "HS256"
JWT_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyOTM5ODE2MSwiaWF0IjoxNzI5Mzk4MTYxfQ.psKzl2mOOl4EWNWKLxFxYhZ0AoQMOdIddTPNG6boaGw"
JWT_REFRESH_SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyOTM5ODI0OCwiaWF0IjoxNzI5Mzk4MjQ4fQ.xvV1MAm6GHuBZrN7QqOoG1Z4bzBI2WpwqrfA4B9tntg"


def decodeJWT(jwtoken: str):
    try:
        payload = jwt.decode(jwtoken, JWT_SECRET_KEY, ALGORITHM)
        return payload

    except InvalidTokenError:
        return None


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=403, detail="Invalid authentication scheme."
                )
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=403, detail="Invalid token or expired token"
                )

            return credentials.credentials

    def verify_jwt(self, jwtoken: str) -> bool:
        isTokenvalid: bool = False

        try:
            payload = decodeJWT(jwtoken)

        except:
            payload = None
            if payload:
                isTokenvalid = True
            return isTokenvalid


jwt_bearer = JWTBearer()
