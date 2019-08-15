# !/bin/bash
# Get servers list:
###########################################################################################
#                        Variables from GitLab server                                     #
# Note: They can’t have spaces!!                                                          #
# Command example: gitlab-deploy.sh server1.example.com,server2.example.com               #
###########################################################################################
SERVERS_STR=$1
SERVER_LIST=(${SERVERS_STR//,/ })

set — f

###########################################################################################
#                Iterate servers for deploy and pull last commit                          #
###########################################################################################
for i in "${!SERVER_LIST[@]}"; do
  echo "Deploy project on server ${array[i]}"
  ssh root@${SERVER_LIST[i]} <<'ENDSSH'
cd /mnt/data/back
git stash
git checkout $CI_BUILD_REF_NAME
git stash
git clean -f
git pull origin $CI_BUILD_REF_NAME
npm i
pm2 restart api
ENDSSH
done
echo "All is done perfectly"
