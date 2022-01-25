from chalice import Chalice
from jwt import PyJWKClient
import json
import jwt
import requests

app = Chalice(app_name='joseki-api')

url = "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EveEoZbAP/.well-known/jwks.json"
jwks_client = PyJWKClient(url)

@app.route('/login', cors=True)
def index():
    code = app.current_request.headers['Authorization']
    response = requests.post('https://login.joseki.cat/oauth2/token',{
        'grant_type': 'authorization_code', 
        'client_id': '24mjbjvra3522lff13op0dnvhm',  
        'code': code,
        'redirect_uri': 'http://localhost:8000/login/'})

    content = json.loads(response.text);

    encoded = content['id_token'] 
    signing_key = jwks_client.get_signing_key_from_jwt(encoded)
    data = jwt.decode(
            encoded,
         signing_key.key,
         algorithms=["RS256"],
         audience="24mjbjvra3522lff13op0dnvhm",
         options={"verify_exp": False},
     )
    return {'token': encoded, 'email': data['email']};
