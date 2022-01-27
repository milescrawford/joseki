from botocore.exceptions import ClientError
from chalice import Chalice
from chalice import NotFoundError
from jwt import PyJWKClient
import boto3
import json
import jwt
import requests

s3 = boto3.resource('s3')
app = Chalice(app_name='joseki-api')
jwks_client = PyJWKClient("https://cognito-idp.us-east-1.amazonaws.com/us-east-1_EveEoZbAP/.well-known/jwks.json")

def check_token(token):
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    data = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience="24mjbjvra3522lff13op0dnvhm",
            options={"verify_exp": False},
            )
    return data['email']

@app.route('/login', cors=True)
def login():
    code = app.current_request.headers['Authorization']
    print(code)
    redirect_uri = 'http://localhost:8000/login/'
    if app.current_request.headers['Host'] == 'api.joseki.cat':
        redirect_uri = 'https://joseki.cat/login/'
    response = requests.post('https://login.joseki.cat/oauth2/token',{
        'grant_type': 'authorization_code', 
        'client_id': '24mjbjvra3522lff13op0dnvhm',  
        'code': code,
        'redirect_uri': redirect_uri
        })
    print(response.text);
    content = json.loads(response.text);
    encoded = content['id_token'] 
    print(encoded);
    email = check_token(encoded);

    return {'token': encoded, 'email': email};


@app.route('/store', methods=['POST'], cors=True)
def store():
    email = check_token(app.current_request.headers['Authorization'])
    s3object = s3.Object('joseki', email + '/joseki.json')
    s3object.put(Body=app.current_request.raw_body)
    return {'stored':True};


@app.route('/load', cors=True)
def load():
    email = check_token(app.current_request.headers['Authorization'])
    s3object = s3.Object('joseki', email + '/joseki.json')
    data = {}
    try:
        data = s3object.get()['Body'].read().decode('utf-8')
    except ClientError as ex:
        if ex.response['Error']['Code'] == 'NoSuchKey':
            raise NotFoundError('No stored joseki')
        else:
            raise
    return data
