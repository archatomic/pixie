.PHONY: android
android: web.build
	yarn cap run android --target Pixel_3_API_31

.PHONY: android.device
android.device: web.build
	DEVICE_ID=$(shell adb devices | awk 'NR==2 {print $$1}');\
	yarn cap run android --target $$DEVICE_ID

.PHONY: android.build
android.build: web.build
	echo 'todo android build'

.PHONY: ios
ios: web.build
	yarn cap run ios --target E647252B-6CC6-453B-B5CA-40BC13694589

.PHONY: ios.build
ios.build: web.build
	echo 'todo ios build'

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
