# Static Site for Joseki Cat

Deploy:
```
docker build -t joseki . && docker run --env-file aws.env joseki
```

Run test server:
```
python3 -m http.server
```
