#!/usr/bin/env bash

set -e
set -o pipefail

SCRIPT_PATH="$(dirname "$0")"
ROOT_PATH="${SCRIPT_PATH}/../../.."

PKG_PATH="${SCRIPT_PATH}/.."
MAN_PATH="${PKG_PATH}/package.json"

# Reading some data from the main package manifest
NAME=$(jq -r '.name' "${MAN_PATH}")
TAG=$(jq -r '.publishConfig.tag' "${MAN_PATH}")
VERSION=$(jq -r '.version' "${MAN_PATH}")


echo "Starting to release the package…"

echo "Building the project first…"
pnpm run build

# Asking user for tag and version
read -e -p "Tag: " -i "${TAG}" TAG
read -e -p "Version: " -i "${VERSION}" VERSION

echo "Updating package manifest…"

jq ".version = \"${VERSION}\"" "${MAN_PATH}" > "${PKG_PATH}/~package.json"
mv "${PKG_PATH}/~package.json" "${MAN_PATH}"

echo "Copying the README file…"
cp "${ROOT_PATH}/README.md" "${PKG_PATH}/"

# Making sure Git is "clean"
if [ -n "$(git status --porcelain)" ]; then
  echo "Git repository content was updated, please commit all the changes and start again"
  exit 1 || return 1
fi

echo "Publishing the package: ${NAME}…"
(cd "${PKG_PATH}" && npm publish --tag "${TAG}")

printf "\nRelease complete…\n\n"

printf "Install the packages with:\n"
echo "[${NAME}]"
echo "— ${NAME}@${VERSION}"
echo "— ${NAME}@${TAG}"
