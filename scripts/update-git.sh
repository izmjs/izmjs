# !/bin/bash
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

  npx ncu -u
  git add .
  git commit -m "chore: update dependencies"
  git push
  ;;

*) echo "Option $1 not recognized" ;; # In case you typed a different option other than a,b,c

esac
