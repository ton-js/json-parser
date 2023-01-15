#!/usr/bin/env bash

set -e
set -o pipefail

SCRIPT_PATH="$(dirname "$0")"
ROOT_PATH="${SCRIPT_PATH}/.."

PKG1_PATH="${ROOT_PATH}/packages/json-parser"
MAN1_PATH="${PKG1_PATH}/package.json"

PKG2_PATH="${ROOT_PATH}/packages/json-parse-polyfill"
MAN2_PATH="${PKG2_PATH}/package.json"

# Reading some data from the main package manifest
NAME1=$(jq -r '.name' "${MAN1_PATH}")
NAME2=$(jq -r '.name' "${MAN2_PATH}")
TAG=$(jq -r '.publishConfig.tag' "${MAN1_PATH}")
VERSION=$(jq -r '.version' "${MAN1_PATH}")


echo "Starting to release the packages…"

echo "Building all the projects in the monorepo first…"
pnpm run -r build

# Asking user for tag and version
read -e -p "Tag: " -i "${TAG}" TAG
read -e -p "Version: " -i "${VERSION}" VERSION

echo "Updating packages manifests…"

jq ".version = \"${VERSION}\"" "${MAN1_PATH}" > "${PKG1_PATH}/~package.json"
mv "${PKG1_PATH}/~package.json" "${MAN1_PATH}"

jq ".version = \"${VERSION}\"" "${MAN2_PATH}" > "${PKG2_PATH}/~package.json"
mv "${PKG2_PATH}/~package.json" "${MAN2_PATH}"

echo "Copying the README files…"
cp "${ROOT_PATH}/README.md" "${PKG1_PATH}/"
cp "${ROOT_PATH}/README.md" "${PKG2_PATH}/"

# Making sure Git is "clean"
if [ -n "$(git status --porcelain)" ]; then
  echo "Git repository content was updated, please commit all the changes and start again"
  exit 1 || return 1
fi

echo "Publishing the package: ${NAME1}…"
(cd "${PKG1_PATH}" && npm publish --tag "${TAG}")

echo "Publishing the package: ${NAME2}…"
(cd "${PKG2_PATH}" && npm publish --tag "${TAG}")

printf "\nRelease complete…\n\n"

printf "Install the packages with:\n"
echo "[${NAME1}]"
echo "— ${NAME1}@${VERSION}"
echo "— ${NAME1}@${TAG}"
echo ""
echo "[${NAME2}]"
echo "— ${NAME2}@${VERSION}"
echo "— ${NAME2}@${TAG}"
