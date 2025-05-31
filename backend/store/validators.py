from rest_framework import serializers

def validate_file_size(file):
    max_size_mb = 5
    max_size_bytes = max_size_mb * 1024 * 1024  # Convert MB to bytes
    if file.size > max_size_bytes:
        raise serializers.ValidationError('File size must be less than 5MB')
    return file


