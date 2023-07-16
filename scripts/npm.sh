#!/bin/bash

if [[ "$OSTYPE" == "darwin"* ]]; then
    realpath() { [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"; }

    ROOT=$(dirname $(dirname $(readlink -f $0)))
    npm_config_arch=x64
else
    ROOT=$(dirname $(dirname $(readlink -f $0)))

    # if [ -z $npm_config_arch ]; then
    #     npm_config_arch=$(node -p process.arch)
    #     echo "aviso: lembrar de determinar \$npm_config_arch para ou x64 ou ia32 para construir os binários para a arquitetura correta. escolhendo '$npm_config_arch'."
    # fi
fi

ELECTRON_VERSION=$(
    cat $ROOT/package.json |
    grep electronVersion |
    sed -e 's/[[:space:]]*"electronVersion":[[:space:]]*"\([0-9.]*\)"\(,\)*/\1/'
)

ELECTRON_GYP_HOME=~/.electron-gyp

mkdir -p $ELECTRON_GYP_HOME

npm_config_disturl=https://atom.io/download/atom-shell \
npm_config_target=$ELECTRON_VERSION \

HOME=$ELECTRON_GYP_HOME \

npm $*