# Use the official Python image.
# https://hub.docker.com/_/python
FROM python:3.11-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the image
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Collect static files (if applicable, adjust if you have a different setup)
# Make sure your STATIC_ROOT is properly configured in settings.py
RUN python manage.py collectstatic --noinput || true

# Expose the port the app runs on
EXPOSE 8000

# Run the web service on container startup.
# We use gunicorn as the WSGI server.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--threads", "2", "--timeout", "0", "vidyanvesha_form.wsgi:application"]
