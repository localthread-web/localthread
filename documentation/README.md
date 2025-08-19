# E2E Test Fixtures

This directory contains test fixtures used in E2E tests.

## Required Files

For the E2E tests to work properly, you need to create the following files:

### Images
- `product-image.jpg` - Sample product image (any JPG file)
- `shop-logo.png` - Sample shop logo (any PNG file)  
- `shop-banner.jpg` - Sample shop banner (any JPG file)

### Data Files
- `test-data.json` - Sample test data for various scenarios

## Creating Test Fixtures

You can create simple test files using any image files you have, or generate placeholder images:

```bash
# Create placeholder images (if you have ImageMagick installed)
convert -size 300x300 xc:white tests/e2e/fixtures/product-image.jpg
convert -size 200x200 xc:blue tests/e2e/fixtures/shop-logo.png
convert -size 800x400 xc:gray tests/e2e/fixtures/shop-banner.jpg
```

Or simply copy any existing image files and rename them to match the expected filenames.

## Note

These fixtures are used for testing file upload functionality in the E2E tests. The actual content doesn't matter for testing purposes - we're just verifying that the upload process works correctly. 