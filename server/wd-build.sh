# important!!
# make sure to run this script in "pos_restarurant/server" path

# remove previous build
rm -rf build
# make a new build
yarn build
# check if env file exists
if [ ! -f '.env' ]; then
    echo "Environment file does not exists"
    echo "Aborting ..."
    exit
fi

# TODO: TARGET_FOLDER is hardcoded
TARGET_FOLDER="/d/POS_SERVER"
# remove from previous build
rm -rf $TARGET_FOLDER

# copy contents of build ,env file and package.json file to target folder
cp -a ./build/. $TARGET_FOLDER
cp .env "$TARGET_FOLDER/.env"
cp package.json "$TARGET_FOLDER/package.json"

# install dependencies
cd $TARGET_FOLDER
yarn install --production=true
