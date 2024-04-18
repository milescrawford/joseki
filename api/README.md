# AWS Lambda API for Joseki Cat

Create a file called `aws.env` and place the application AWS credentials into it:
```
AWS_ACCESS_KEY_ID=XXXX
AWS_SECRET_ACCESS_KEY=XXX
AWS_DEFAULT_REGION=us-east-1
```

## Dev 
To build the image and run in local mode:
```
docker build -t joseki-api . && docker run --env-file aws.env -v `pwd`:/joseki-api/ -p 80:80 -ti joseki-api
```

You should be able to edit files locally and the dev server will reload.

## Deploying

```
docker build -t joseki-api . && docker run --env-file aws.env -ti joseki-api chalice deploy
```
