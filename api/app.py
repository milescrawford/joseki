from chalice import Chalice

app = Chalice(app_name='joseki-api')

import jwt
from jwt import PyJWKClient
url = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_GBQAb61VX/.well-known/jwks.json"
jwks_client = PyJWKClient(url)


@app.route('/')
def index():
    encoded = app.current_request.headers['Authorization']
    signing_key = jwks_client.get_signing_key_from_jwt(encoded)
    data = jwt.decode(
            encoded,
         signing_key.key,
         algorithms=["RS256"],
         audience="2j8r5hho8v00qkq3gbns5o456",
         options={"verify_exp": False},
     )

    return data
