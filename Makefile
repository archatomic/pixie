.PHONY: android
android: web.build
	yarn cap run android -l --external

.PHONY: ios
ios: web.build
	yarn cap run ios -l --external

.PHONY: desktop
desktop: web.build
	cd electron; \
	yarn electron .;

.PHONY: web
web:
	cd client; \
	yarn start;

.PHONY: web.build
web.build:
	cd client; \
	yarn build;
