FROM ubuntu:oracular
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive


RUN apt update && apt-get upgrade -y 
RUN apt install -y npm awscli
RUN npm install terser -g

COPY . /joseki/
WORKDIR /joseki/

CMD ["./deploy.sh"]
