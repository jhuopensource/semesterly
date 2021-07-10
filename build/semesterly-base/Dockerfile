FROM python:3.9.6
RUN apt-get update

RUN apt-get install -y \
	python-pip \
	libpq-dev \
	libxml2-dev \
	libxslt-dev \
	git \
	curl \
	nginx

# Install node 12.x
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# This saves some build time by installing base requirements
ADD ./requirements_base.txt /tmp
RUN pip3 install -r /tmp/requirements_base.txt
