# run this command before uploading to the Mozilla or Chrome store
package:
	npm package

# requires: npm install --save-dev jest
test:
	npx jest

build: test
	npm build
	