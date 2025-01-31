#!/bin/bash

# Function to build a directory if it has package.json
build_directory() {
    local dir=$1
    if [ -f "$dir/package.json" ]; then
        echo "Building $dir..."
        cd "$dir" || exit
        npm install
        npm run build
        cd - > /dev/null
    fi
}

# Root directory
ROOT_DIR="$(pwd)"

# Build layers
echo "Building layers..."
LAYERS_DIR="$ROOT_DIR/src/layers"
if [ -d "$LAYERS_DIR" ]; then
    for layer in "$LAYERS_DIR"/*; do
        if [ -d "$layer" ]; then
            build_directory "$layer"
        fi
    done
fi

# Build functions
echo "Building functions..."
FUNCTIONS_DIR="$ROOT_DIR/src/functions"
if [ -d "$FUNCTIONS_DIR" ]; then
    for func in "$FUNCTIONS_DIR"/*; do
        if [ -d "$func" ]; then
            build_directory "$func"
        fi
    done
fi

# Run SAM build
echo "Running SAM build..."
sam build
