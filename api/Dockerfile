FROM ubuntu:latest
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive


RUN apt update && apt-get upgrade -y 
RUN apt install -y npm awscli python3 python3-pip python3-dev 
RUN pip3 install --upgrade awscli boto3 chalice pyjwt[crypto]
run npm install terser -g

COPY . /joseki-api/
WORKDIR /joseki-api/

CMD chalice local --host 0.0.0.0 --port 80
