#!/bin/sh

rsync -av amxa.ch:public_html/speierling/gis/ --exclude map/node/ --exclude node-editor .


