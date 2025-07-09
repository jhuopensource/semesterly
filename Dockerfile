#! should update to newer version of node base image
FROM node:18-bookworm

# Create code dir
RUN mkdir /code
WORKDIR /code

# Install Python dependencies
RUN apt-get update && apt-get install -y python3-pip python3-venv && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Add everything
ADD . /code/

# Create and activate virtual environment
ENV VIRTUAL_ENV=/code/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install dependencies in the virtual environment
RUN pip install --no-cache-dir -r /code/requirements.txt

# Use environment based config
COPY ./build/local_settings.py /code/semesterly/local_settings.py

# Add parser script
COPY ./build/run_parser.sh /code/run_parser.sh

# Install package.json dependencies
RUN yarn
RUN yarn build

# To enable unbuffered logging
ENV PYTHONUNBUFFERED=1
