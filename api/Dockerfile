FROM ubuntu:latest
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive


RUN apt update && apt-get upgrade -y 
RUN apt install -y python3 python3-pip python3-dev 
COPY ./requirements.txt .
RUN pip3 install -r requirements.txt

COPY . /joseki-api/
WORKDIR /joseki-api/

CMD chalice local --host 0.0.0.0 --port 80
