git clone https://github.com/zsnout/zsnout.com.git zsnout
cd zsnout
npm ci
cd builder; npm ci; cd ..
cd client; npm ci; cd ..
cd server; npm ci; cd ..
npm run build
echo "
zSnout has been installed!
To watch the directory, run 'npm run watch'.
To build the directory, run 'npm run build'.
To launch the server, run 'npm start'.
If you update any files in the 'server/cli' folder make sure to rebuild the project before watching, as these files are used in the watch process.
For more information, check out the README available at https://github.com/zSnout/zsnout.com/#readme."
