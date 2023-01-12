#!/usr/bin/env bash

set -e
set -o pipefail

SCRIPT_PATH="$(dirname "$0")"
ROOT_PATH="${SCRIPT_PATH}/.."
PACKAGE_PATH="${ROOT_PATH}/package"
MANIFEST_PATH="${PACKAGE_PATH}/package.json"


# Reading some data from the package manifest
NAME=$(jq -r '.name' "${MANIFEST_PATH}")
TAG=$(jq -r '.publishConfig.tag' "${MANIFEST_PATH}")
VERSION=$(jq -r '.version' "${MANIFEST_PATH}")


echo "Starting to release the package: ${NAME}"

echo "Building all the projects in the monorepo first…"
pnpm run -r build

# Asking user for tag and version
read -e -p "Tag: " -i "${TAG}" TAG
read -e -p "Version: " -i "${VERSION}" VERSION

echo "Updating package manifest…"
jq ".version = \"${VERSION}\"" "${MANIFEST_PATH}" > "${PACKAGE_PATH}/~package.json"
mv "${PACKAGE_PATH}/~package.json" "${MANIFEST_PATH}"

echo "Copying README file…"
cp "${ROOT_PATH}/README.md" "${PACKAGE_PATH}/"

# Making sure Git is "clean"
if [ -n "$(git status --porcelain)" ]; then
  echo "Git repository content was updated, please commit all the changes and start again"
  exit 1 || return 1
fi

echo "Publishing the package…"
(cd "${PACKAGE_PATH}" && npm publish --tag "${TAG}")

printf "\nRelease complete…\n\n"

echo "Install it with:"
echo "— ${NAME}@${VERSION}"
echo "— ${NAME}@${TAG}"
