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
git checkout -- .
git checkout $CI_BUILD_REF_NAME
git clean -f
git pull origin $CI_BUILD_REF_NAME
pm2 restart all
ENDSSH
done
echo "All is done perfectly"
