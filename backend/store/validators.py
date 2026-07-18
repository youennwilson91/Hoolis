from django.core.exceptions import ValidationError
import os

ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
ALLOWED_IMAGE_CONTENT_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
]


def validate_file_size(file):
    max_size_mb = 5
    max_size_bytes = max_size_mb * 1024 * 1024
    if file.size > max_size_bytes:
        raise ValidationError('File size must be less than 5MB')
    return file


def validate_image_file(file):
    """Valide le type et la taille d'une image uploadée"""
    # Validation taille
    validate_file_size(file)

    # Validation extension
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f'Extension non autorisée. Extensions acceptées: {", ".join(ALLOWED_IMAGE_EXTENSIONS)}'
        )

    # Validation content-type
    if hasattr(file, 'content_type') and file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValidationError(
            'Type de fichier non autorisé. Seules les images sont acceptées.'
        )

    return file


