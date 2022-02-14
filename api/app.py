from botocore.exceptions import ClientError
from chalice import Chalice
from chalice import NotFoundError
from jwt import PyJWKClient
import boto3
import json
import jwt
import requests
import datetime

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

def parse_date(date):
    return datetime.datetime.strptime(date, '%Y-%m-%d')


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

@app.route('/load-score/{date}', cors=True)
def load(date):
    email = check_token(app.current_request.headers['Authorization'])
    s3object = s3.Object('joseki', email + '/scores.json')
    data = {}
    try:
        data = json.loads(s3object.get()['Body'].read().decode('utf-8'))
    except ClientError as ex:
        if ex.response['Error']['Code'] == 'NoSuchKey':
            raise NotFoundError('No stored joseki')
        else:
            raise

    #check streak
    cur = parse_date(date)
    streak = 0
    for i in reversed(data['streak']):
        check = parse_date(i['date'])
        if (cur - check).days <= 1:
            cur = check
            streak = streak + 1
        else:
            break


    return {'highScore': data['highScore'], 'streak': streak}

@app.route('/store-score', methods=['POST'], cors=True)
def store():
    email = check_token(app.current_request.headers['Authorization'])
    s3object = s3.Object('joseki', email + '/scores.json')
    existing = {'highScore':0, 'streak':[]}
    try:
        existing = json.loads(s3object.get()['Body'].read().decode('utf-8'))
    except ClientError as ex:
        if ex.response['Error']['Code'] == 'NoSuchKey':
            existing = {'highScore':0, 'streak':[]}
        else:
            raise

    data = app.current_request.json_body
    if existing['highScore'] < data['highScore']:
        existing['highScore'] = data['highScore']

    if data['score'] > 0:
        if len(existing['streak']) ==0 or existing['streak'][-1]['date'] != data['date']:
            existing['streak'].append({'date': data['date'], 'score': data['score']})
        else:
            existing['streak'][-1]['score'] = data['score']


    s3object.put(Body=json.dumps(existing))
    return {'stored':True};
