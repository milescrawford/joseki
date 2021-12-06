FROM ubuntu:latest
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive


RUN apt update && apt-get upgrade -y 
RUN apt install -y npm
run npm install terser -g

COPY . /joseki/
WORKDIR /joseki/

RUN terser -c -m -o joseki.min.js -- joseki.js
CMD cat joseki.min.js
