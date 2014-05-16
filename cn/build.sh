pushd .
rm -rf ripplemaster
mkdir ripplemaster
mkdir ripplemaster/public
mkdir ripplemaster/html
cp -r css ripplemaster/public/
cp -r images ripplemaster/public/
cp -r js ripplemaster/public
cp -r lib ripplemaster/public
cp *.html ripplemaster/html/
cp *.js ripplemaster/
popd
