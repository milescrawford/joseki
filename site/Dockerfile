FROM ubuntu:latest
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive


RUN apt update && apt-get upgrade -y 
RUN apt install -y npm awscli
run npm install terser -g

COPY . /joseki/
WORKDIR /joseki/

CMD terser -c -m -o joseki.js --timings -- joseki.js && \
aws s3 cp index.html s3://joseki.milescrawford.com/ && \
aws s3 cp edit/index.html s3://joseki.milescrawford.com/edit/ &&  \
aws s3 cp about/index.html s3://joseki.milescrawford.com/about/ &&  \
aws s3 cp style.css s3://joseki.milescrawford.com/ && \
aws s3 cp joseki.js s3://joseki.milescrawford.com/ && \
aws s3 cp wgo.min.js s3://joseki.milescrawford.com/ && \
aws s3 cp bootstrap.min.css s3://joseki.milescrawford.com/
