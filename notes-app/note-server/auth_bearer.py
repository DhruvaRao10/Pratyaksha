from datetime import datetime, timezone
import jwt
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

load_dotenv()

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
        self.JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        self.ALGORITHM = "HS256"
        if not self.JWT_SECRET_KEY:
            raise ValueError("JWT_SECRET_KEY environment variable is not set")

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        
        if not credentials:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")
        
        if not credentials.scheme == "Bearer":
            raise HTTPException(status_code=403, detail="Invalid authentication scheme.")
            
        if not self.verify_jwt(credentials.credentials):
            raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            
        return credentials.credentials

    def verify_jwt(self, token: str) -> bool:
        try:
            print(f"Verifying token: {token}")
            payload = jwt.decode(
                token, 
                self.JWT_SECRET_KEY, 
                algorithms=[self.ALGORITHM]
            )
            
            # Verify expiration
            exp = payload.get("exp")
            if exp is None:
                print("Token does not have 'exp' claim")
                return False
            
            # Convert exp to datetime for comparison
            exp_datetime = datetime.fromtimestamp(exp, tz=timezone.utc)
            if exp_datetime < datetime.now(tz=timezone.utc):
                print(f"Token expired at {exp_datetime}")
                return False
            
            print("Token verified successfully")
            return True
            
        except jwt.ExpiredSignatureError:
            print("Token signature has expired")
            return False
            
        except jwt.InvalidTokenError:
            print("Token is invalid")
            return False
            
        except Exception as e:
            print(f"Unexpected error while verifying token: {str(e)}")
            return False


jwt_bearer = JWTBearer()
