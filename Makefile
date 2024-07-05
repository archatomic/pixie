.PHONY: android
android: web.build
	yarn cap run android --target Pixel_3_API_31

.PHONY: android.device
android.device: web.build
	DEVICE_ID=$(shell adb devices | awk 'NR==2 {print $$1}');\
	yarn cap run android --source-map --target $$DEVICE_ID

.PHONY: android.build
android.build: web.build
	echo 'Android Build Not Implemented'

.PHONY: ios
ios: web.build
	yarn cap run ios

.PHONY: ios.build
ios.build: web.build
	echo 'iOS Build Not Implemented'

.PHONY: desktop
desktop: web.build
	cd electron; \
	yarn electron .;

.PHONY: desktop.build
desktop.build: web.build
	echo 'todo desktop build... @see electron-forge'

.PHONY: web
web:
	cd client; \
	yarn start;

.PHONY: web.build
web.build:
	cd client; \
	yarn build;

.PHONY: web.clean.build
web.clean.build: clean web.build

.PHONY: clean
clean:
	rm -rf dist
	rm -rf client/dist
	rm -rf client/.parcel-cache

.PHONY: git.stage-case-changes
git.stage-case-changes:
	git rm -r --cached .; \
    git add --all .;

.PHONY: install
install:
	yarn install; \
	cd client; \
	yarn install; \
	cd ../electron; \
	yarn install;
