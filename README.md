# joseki

Deploy:
```
docker build -t joseki . && docker run -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION joseki
```

Run test server:
```
python3 -m http.server
```
