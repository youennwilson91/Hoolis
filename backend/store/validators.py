def validate_file_size(file):
    max_size_mb = 5
    if file.size > max_size_mb:
        raise serializers.ValidationError('File size must be less than 5MB')
    return file


