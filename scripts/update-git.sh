# !/bin/bash
RED='\033[0;31m'
NC='\033[0m'

echo "*********************************************************************************************"
echo "* Working directory: `pwd`"
echo "*********************************************************************************************"

case "$1" in

pull)
  git stash
  git pull
  git stash pop
  ;;

update-deps)
  if ! (hash ncu 2>/dev/null); then
    echo "npm-check-updates does not exist, installing it globally..."
    npm i -g npm-check-updates
  fi

  if ! (git diff --exit-code --quiet 2>/dev/null); then
    echo "${RED}please commit your work before running this script${NC}"
  else
    npx ncu -u
    git add .
    git commit -nm "chore: update dependencies"
    git push
  fi
  ;;

*) echo "Option $1 not recognized" ;; # In case you typed a different option other than a,b,c

esac
echo ""
