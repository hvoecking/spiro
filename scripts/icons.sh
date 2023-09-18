#! /usr/bin/env bash
set -eou pipefail

ASSETS_DIR=assets/icons
BUILD_DIR=build/icons

css-to-icon() {
    asset=$1; shift
    name=$1; shift
    echo "/** Auto-generated CSS file. Do not edit. **/"
    echo ".${name} {"
    echo "    background-image: url(data:image/png;base64,$(convert $asset -resize 64x - | base64 | tr -d '\n'));"
    echo "    background-size: contain;"
    echo "    background-repeat: no-repeat;"
    echo "}"
}

generate-icons() (
    tmp=$(mktemp -d)
    trap "[ -d $tmp ] && rm -r $tmp || true" EXIT
    tmp_build="$tmp/$BUILD_DIR"
    mkdir -p "$tmp_build"
    echo "/** Auto-generated CSS file. Do not edit. **/" > "$tmp_build/icons.css"
    for asset in "$ASSETS_DIR"/*.png
    do
        name=$(basename $asset .png)
        echo "@import \"./$name.css\";" >> "$tmp_build/icons.css"
        css-to-icon "$asset" "$name-icon" > "$tmp_build/$name.css"
    done
    clean-icons
    mv "$tmp_build" $(dirname "$BUILD_DIR")
)

clean-icons() {
    [ -d "$BUILD_DIR" ] && rm "$BUILD_DIR"/*css && rmdir "$BUILD_DIR" || true
}

generate-icons
