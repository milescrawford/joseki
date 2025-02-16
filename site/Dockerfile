FROM ubuntu:oracular
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV DEBIAN_FRONTEND=noninteractive


RUN apt update && apt-get upgrade -y 
RUN apt install -y npm awscli

COPY . /joseki/
WORKDIR /joseki/
RUN rm -rf ./tests/

CMD ["./deploy.sh"]
