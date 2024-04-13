FROM semesterly.azurecr.io/python:3.8.5
RUN apt-get update

RUN apt-get install -y \
	python3-pip \
	libpq-dev \
	libxml2-dev \
	libxslt-dev \
	git \
	curl

# Install node 14.x
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# This saves some build time by installing base requirements
RUN apt install libxmlsec1 libxmlsec1-dev

ADD ./requirements_base.txt /tmp
RUN pip3 install -r /tmp/requirements_base.txt
