#! /usr/bin/env bash
set -eou pipefail

ASSETS_DIR=assets/icons
BUILD_DIR=build/icons

img-to-css() {
    asset=$1; shift
    name=$1; shift

    if [[ $asset == *.png ]]
    then
        data_url=$(png-to-base64 "$asset")
    elif [[ $asset == *.svg ]]
    then
        data_url=$(svg-to-base64 "$asset")
    else
        echo "Unknown asset type: $asset" >&2
        exit 1
    fi

    echo "/** Auto-generated CSS file. Do not edit. **/"
    echo ".${name} {"
    echo "    background-image: $data_url;"
    echo "    background-size: contain;"
    echo "    background-repeat: no-repeat;"
    echo "}"
}


png-to-base64() {
    asset=$1; shift
    # TODO: The convert command is deprecated in ImageMagick 7. But ubuntu 24.04 which
    # is used in the workflow still uses ImageMagick 6. Once the workflow supports
    # ImageMagick 7 change this to use the `magick` command.
    echo "url(data:image/png;base64,$(convert $asset -resize 64x - | base64 | tr -d '\n'))"
}

svg-to-base64() {
    asset=$1; shift
    echo "url(data:image/svg+xml;base64,$(base64 $asset | tr -d '\n'))"
}

generate-icons() (
    tmp=$(mktemp -d)
    trap "[ -d $tmp ] && rm -r $tmp || true" EXIT
    tmp_build="$tmp/$BUILD_DIR"
    mkdir -p "$tmp_build"
    echo "/** Auto-generated CSS file. Do not edit. **/" > "$tmp_build/icons.css"
    for type in png
    do
        for asset in "$ASSETS_DIR"/*."$type"
        do
            name=$(basename $asset ."$type")
            echo "@import \"./$name.css\";" >> "$tmp_build/icons.css"
            img-to-css "$asset" "$name-icon" > "$tmp_build/$name.css"
        done
    done
    clean-icons
    mkdir -p $(dirname "$BUILD_DIR")
    mv "$tmp_build" "$BUILD_DIR"
)

clean-icons() {
    [ -d "$BUILD_DIR" ] && rm "$BUILD_DIR"/*css && rmdir "$BUILD_DIR" || true
}

generate-icons
