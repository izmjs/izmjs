# !/bin/bash
RED='\033[0;31m'
NC='\033[0m'

echo "*********************************************************************************************"
echo "* Working directory: $(pwd)"
echo "*********************************************************************************************"

case "$1" in

git-pull)
  git stash
  git pull
  git stash pop
  ;;

git-push)
  git add .
  git commit
  git push
  ;;

npm-update)
  if ! (hash ncu 2>/dev/null); then
    echo "npm-check-updates does not exist, installing it globally..."
    npm i -g npm-check-updates
  fi

  if ! (git diff --exit-code --quiet 2>/dev/null); then
    echo "${RED}please commit your work before running this script${NC}"
  else
    npx ncu -u

    if ! (git diff --exit-code --quiet 2>/dev/null); then
      git add .
      git commit -m "chore: update dependencies"
      git push
    fi
  fi
  ;;

npm-audit)
  npm audit
  ;;

npm-audit-fix)
  npm audit fix
  ;;

*) echo "Option $1 not recognized" ;; # In case you typed a different option other than a,b,c

esac
echo ""
